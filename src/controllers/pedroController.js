var pedroModel = require("../models/pedroModel");

const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

// Bucket onde o Lambda grava os JSONs de dashboard
const CLIENT_BUCKET = process.env.CLIENT_BUCKET || "vizor-client";
const CLIENT_PREFIX = process.env.CLIENT_PREFIX || "pedro-client/";

// cliente S3 – usa as credenciais definidas no .env 
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

// converte o Body do GetObject para string
async function bodyToString(body) {
  // SDK v3 novo tem transformToString
  if (body && typeof body.transformToString === "function") {
    return body.transformToString();
  }

  // fallback
  return await new Promise((resolve, reject) => {
    let data = "";
    body.on("data", (chunk) => (data += chunk.toString()));
    body.on("end", () => resolve(data));
    body.on("error", reject);
  });
}

/**
 * le todos os jsons
 * vizor-client/pedro-client/<empresa>/<AAAA-MM-DD>/<maquina_id>.json
 * e consolida em um mapa
 */
async function carregarDashboardsS3() {
  console.log("[S3] Listando JSONs no bucket client:", CLIENT_BUCKET, "prefix:", CLIENT_PREFIX);

  const listCmd = new ListObjectsV2Command({
    Bucket: CLIENT_BUCKET,
    Prefix: CLIENT_PREFIX,
  });

  const listResp = await s3.send(listCmd);
  const objetos = listResp.Contents || [];

  if (!objetos.length) {
    console.log("[S3] Nenhum JSON encontrado no prefixo informado.");
    return new Map();
  }

  // mantem só os arquivos .json
  const arquivosJson = objetos.filter((o) => o.Key.endsWith(".json"));
  console.log("[S3] Total de JSONs encontrados:", arquivosJson.length);

  // baixa e parseia todos os JSONs encontrados
  const resultados = await Promise.all(
    arquivosJson.map(async (obj) => {
      try {
        const getCmd = new GetObjectCommand({
          Bucket: CLIENT_BUCKET,
          Key: obj.Key,
        });

        const getResp = await s3.send(getCmd);
        const texto = await bodyToString(getResp.Body);
        const json = JSON.parse(texto);

        // Garantimos pelo menos company e machine_id
        const company = json.company || "N/A";
        const machineId = json.machine_id || json.id || null;
        if (!machineId) {
          console.warn("[S3] JSON sem machine_id:", obj.Key);
          return null;
        }

        // Tentamos extrair a data do próprio caminho:
        // pedro-client/<empresa>/<AAAA-MM-DD>/<maquina_id>.json
        let dataArquivo = null;
        const partes = obj.Key.split("/");
        if (partes.length >= 4) {
          const possivelData = partes[partes.length - 2];
          if (/^\d{4}-\d{2}-\d{2}$/.test(possivelData)) {
            dataArquivo = possivelData;
          }
        }

        return {
          company,
          machineId,
          data: json,
          dataArquivo,
        };
      } catch (e) {
        console.error("[S3] Erro ao ler JSON de", obj.Key, e);
        return null;
      }
    })
  );

  // se tiver varios json pega o mais recente
  const mapa = new Map();

  const itensValidos = resultados.filter(Boolean);
  console.log("[S3] JSONs válidos carregados:", itensValidos.length);

  itensValidos.forEach((item) => {
    const key = `${item.company}#${item.machineId}`;
    const novoJson = item.data;
    const existente = mapa.get(key);

    // função que tenta descobrir a "data do dado"
    const parseData = (obj, fallbackDataArquivo) => {
      // se o Lambda preencheu last_update, usamos isso
      if (obj.last_update) return new Date(obj.last_update);
      // se dentro de raw_metrics tiver timestamp, tentamos usar
      if (obj.raw_metrics && obj.raw_metrics.timestamp) {
        return new Date(obj.raw_metrics.timestamp);
      }
      // se nada disso vier, usamos a data extraída da key (AAAA-MM-DD)
      if (fallbackDataArquivo) return new Date(fallbackDataArquivo);
      // se ainda assim nada, voltamos para 1970 (bem antigo)
      return new Date(0);
    };

    if (!existente) {
      // primeira vez que vemos essa máquina -> coloca no mapa direto
      mapa.set(key, novoJson);
    } else {
      // já temos JSON dessa máquina, comparamos qual é mais recente
      const dataAntiga = parseData(existente, null);
      const dataNova = parseData(novoJson, item.dataArquivo);

      if (dataNova > dataAntiga) {
        mapa.set(key, novoJson);
      }
    }
  });

  console.log("[S3] Máquinas consolidadas (company#machine_id):", mapa.size);
  return mapa;
}

/**
 * endpoint principal da sua dashboard
 * busca os DOOHs cadastrados no MySQL
 * carrega os JSONs do S3
 * junta as duas coisas e devolve uma lista pronta pro front
 */
function listar(req, res) {
  pedroModel
    .listar()
    .then(async function (resultado) {
      console.log("[DB] Registros retornados do banco:", resultado.length);

      if (resultado.length === 0) {
        return res.status(204).send("Nenhum resultado encontrado!");
      }

      // 1) Tenta carregar os dashboards do S3
      let mapaS3 = new Map();
      try {
        mapaS3 = await carregarDashboardsS3();
      } catch (e) {
        console.error("[S3] Erro ao carregar dashboards do S3:", e);
      }

      // para cada linha do banco, tentamos encaixar o JSON do S3
      const listaFormatada = resultado.map((row) => {
        // ID do DOOH padronizado – tem que bater com a pasta do trusted
        const machineId = `DOOH-SP-P${String(row.id).padStart(3, "0")}`;

        // chave pra junção com o JSON do Lambda
        const empresa = row.empresa;
        const chave = `${empresa}#${machineId}`;

        const jsonS3 = mapaS3.get(chave) || null;

        // endereço bonitinho vindo do banco
        const location = `${row.rua}, ${row.numero} - ${row.bairro}`;

        if (jsonS3) {
          // se achamos JSON no S3, usamos ele como base
          const raw = jsonS3.raw_metrics || {};

          return {
            // campos principais que o front espera
            machine_id: jsonS3.machine_id || machineId,
            company: jsonS3.company || empresa,
            status: jsonS3.status || "ok",
            last_update: jsonS3.last_update || null,

            // métricas cruas – se algo não vier, usamos valores default
            raw_metrics: {
              cpu: raw.cpu || "0%",
              ram: raw.ram || "0%",
              disco: raw.disco || raw.disk || "0%",
              temp: raw.temp || "0°C",
              uptime: raw.uptime || 0,
              latitude:
                raw.latitude !== undefined
                  ? raw.latitude
                  : parseFloat(row.latitude),
              longitude:
                raw.longitude !== undefined
                  ? raw.longitude
                  : parseFloat(row.longitude),
            },

            // bloco de UI vindo do Lambda, mas forçamos a location do banco
            ui: {
              ...(jsonS3.ui || {}),
              location,
            },

            // blocos analíticos do Lambda 
            risk_model: jsonS3.risk_model || null,
            medianas: jsonS3.medianas || null,
            regressao_risco: jsonS3.regressao_risco || null,
            historico_7d: jsonS3.historico_7d || null,
          };
        }

        // Se ainda NÃO existe JSON para essa máquina no S3,
        // devolvemos um "cadastro básico" só pra já aparecer no mapa
        return {
          machine_id: machineId,
          company: empresa,
          status: "ok",
          last_update: null,
          raw_metrics: {
            cpu: "0%",
            ram: "0%",
            disco: "0%",
            temp: "0°C",
            uptime: 0,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
          },
          ui: {
            severity: "INFO",
            color: "green",
            icon: "check-circle",
            title: "Cadastrado no mapa",
            message: "Aguardando primeiros dados de captura.",
            action: "Nenhuma ação necessária no momento.",
            location,
          },
          risk_model: null,
          medianas: null,
          regressao_risco: null,
          historico_7d: null,
        };
      });

      console.log("[API] Enviando", listaFormatada.length, "dispositivos para o front.");
      return res.status(200).json(listaFormatada);
    })
    .catch(function (erro) {
      console.log("\nHouve um erro ao buscar os dados: ", erro.sqlMessage);
      res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
  listar,
};

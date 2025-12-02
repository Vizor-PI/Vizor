var pedroModel = require("../models/pedroModel");
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

const CLIENT_BUCKET = process.env.CLIENT_BUCKET || "vizor-client";
// Ajuste para garantir que pegamos a pasta certa. Se tiver duvida, use apenas "pedro-client/"
const CLIENT_PREFIX = "pedro-client/"; 

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

async function bodyToString(body) {
  if (body && typeof body.transformToString === "function") {
    return body.transformToString();
  }
  return await new Promise((resolve, reject) => {
    let data = "";
    body.on("data", (chunk) => (data += chunk.toString()));
    body.on("end", () => resolve(data));
    body.on("error", reject);
  });
}

async function carregarDashboardsS3() {
  console.log("[S3] Listando JSONs em:", CLIENT_BUCKET, CLIENT_PREFIX);

  // Lista recursiva simples
  let objetos = [];
  try {
      const listCmd = new ListObjectsV2Command({ Bucket: CLIENT_BUCKET, Prefix: CLIENT_PREFIX });
      const listResp = await s3.send(listCmd);
      objetos = listResp.Contents || [];
  } catch (e) {
      console.error("[S3] Erro ao listar objetos:", e);
      return new Map();
  }

  const arquivosJson = objetos.filter((o) => o.Key.endsWith(".json"));
  console.log("[S3] Arquivos JSON encontrados:", arquivosJson.length);

  const resultados = await Promise.all(
    arquivosJson.map(async (obj) => {
      try {
        const getCmd = new GetObjectCommand({ Bucket: CLIENT_BUCKET, Key: obj.Key });
        const getResp = await s3.send(getCmd);
        const texto = await bodyToString(getResp.Body);
        const json = JSON.parse(texto);

        // Extrair data do caminho: pedro-client/Empresa/DD-MM-YYYY/COD.json
        let dataArquivo = null;
        const partes = obj.Key.split("/");
        if (partes.length >= 2) {
            // Pega a penúltima parte (a pasta da data)
            const pastaData = partes[partes.length - 2];
            // [CORREÇÃO] Regex para DD-MM-YYYY (formato do Python)
            if (/^\d{2}-\d{2}-\d{4}$/.test(pastaData)) {
                // Converte para ISO para o JS entender (YYYY-MM-DD)
                const [d, m, y] = pastaData.split('-');
                dataArquivo = `${y}-${m}-${d}`;
            }
        }

        return {
          // [CORREÇÃO] Normaliza company para garantir match (sem espaços)
          company: (json.company || "N/A").replace(/ /g, "_"), 
          machineId: json.machine_id || json.id,
          data: json,
          dataArquivo,
        };
      } catch (e) {
        return null;
      }
    })
  );

  const mapa = new Map();
  const itensValidos = resultados.filter(Boolean);

  itensValidos.forEach((item) => {
    // Chave única: Tech_Solutions#COD001
    const key = `${item.company}#${item.machineId}`;
    
    const novoJson = item.data;
    const existente = mapa.get(key);

    const parseData = (obj, fallback) => {
      // Tenta ler data brasileira do JSON (DD/MM/YYYY)
      if (obj.last_update && obj.last_update.includes("/")) {
          const [d, m, y_hm] = obj.last_update.split('/');
          const [y, hm] = y_hm.split(' ');
          return new Date(`${y}-${m}-${d}T${hm}:00`);
      }
      if (fallback) return new Date(fallback);
      return new Date(0);
    };

    if (!existente) {
      mapa.set(key, novoJson);
    } else {
      // Lógica de "vence o mais recente"
      const d1 = parseData(existente, null);
      const d2 = parseData(novoJson, item.dataArquivo);
      if (d2 > d1) mapa.set(key, novoJson);
    }
  });

  console.log("[S3] Mapa consolidado (size):", mapa.size);
  // Debug: mostra uma chave para conferir se bate com o esperado
  if(mapa.size > 0) console.log("[S3] Exemplo de chave no mapa:", mapa.keys().next().value);
  
  return mapa;
}

function listar(req, res) {
  pedroModel.listar()
    .then(async function (resultado) {
      if (resultado.length === 0) {
        return res.status(204).send("Nenhum resultado encontrado no Banco!");
      }

      let mapaS3 = new Map();
      try {
        mapaS3 = await carregarDashboardsS3();
      } catch (e) {
        console.error(e);
      }

      const listaFormatada = resultado.map((row) => {
        // [CORREÇÃO CRÍTICA DE MATCHING]
        // 1. Normaliza empresa do banco (Tech Solutions -> Tech_Solutions)
        const empresaNorm = row.empresa.replace(/ /g, "_");
        // 2. Usa o código real do banco (COD001) em vez de ID artificial
        const codigoReal = row.codigo; 

        // Monta a chave igual à do S3: Tech_Solutions#COD001
        const chave = `${empresaNorm}#${codigoReal}`;
        
        const jsonS3 = mapaS3.get(chave);

        // Se achou, usa o JSON. Se não, usa fallback com dados do banco
        if (jsonS3) {
            console.log(`[MATCH] Encontrado dados S3 para ${chave}`);
            const raw = jsonS3.raw_metrics || {};
            return {
                machine_id: jsonS3.machine_id,
                company: jsonS3.company,
                status: jsonS3.status,
                last_update: jsonS3.last_update,
                raw_metrics: raw, // Usa as métricas reais do JSON
                ui: { location: row.location }, // Mantém local do banco
                risk_model: jsonS3.risk_model,
                medianas: jsonS3.medianas,
                regressao_risco: jsonS3.regressao_risco,
                historico_7d: jsonS3.historico_7d
            };
        } else {
            // Fallback (apenas dados do banco, métricas zeradas)
            // console.log(`[MISS] Sem dados S3 para ${chave}`);
            return {
                machine_id: codigoReal, // Exibe COD001 mesmo sem dados S3
                company: row.empresa,
                status: "ok",
                location: row.location,
                lat: parseFloat(row.latitude),
                lng: parseFloat(row.longitude),
                // Métricas zeradas para não quebrar o front
                cpu: 0, ram: 0, disk: 0, temp: 0, uptime: 0
            };
        }
      });

      res.status(200).json(listaFormatada);
    })
    .catch(function (erro) {
      console.log(erro);
      res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
  listar,
};
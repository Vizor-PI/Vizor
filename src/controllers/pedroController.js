var pedroModel = require("../models/pedroModel");
const fs = require("fs");
const path = require("path");

// pasta fixa dos JSONs
const JSON_DIR = path.join(__dirname, "..", "..", "public", "assets", "json");

/**
 * Carrega todos os .json dentro de /public/assets/json
 * e monta um Map com chave "company#machine_id"
 */
async function carregarJsonLocal() {
  let arquivos = [];

  try {
    arquivos = await fs.promises.readdir(JSON_DIR);
  } catch (err) {
    console.error("[LOCAL] Erro ao ler pasta JSON:", err.message);
    return new Map();
  }

  const jsonFiles = arquivos.filter((f) => f.toLowerCase().endsWith(".json"));
  console.log("[LOCAL] JSONs encontrados:", jsonFiles.length);

  const mapa = new Map();

  for (const file of jsonFiles) {
    try {
      const fullPath = path.join(JSON_DIR, file);
      const texto = await fs.promises.readFile(fullPath, "utf8");
      const json = JSON.parse(texto);

      const empresaNorm = (json.company || "N/A").replace(/ /g, "_");
      const codigo = json.machine_id || json.id;

      if (!codigo) {
        console.warn(`[LOCAL] Arquivo ${file} sem machine_id/id, ignorando.`);
        continue;
      }

      const chave = `${empresaNorm}#${codigo}`;
      mapa.set(chave, json);
    } catch (err) {
      console.error(`[LOCAL] Falha ao ler ${file}:`, err.message);
    }
  }

  return mapa;
}

async function listar(req, res) {
  let resultadoBanco = [];
  let erroBanco = null;

  // 1) tenta buscar no banco, mas NÃO mata a rota se der erro
  try {
    resultadoBanco = await pedroModel.listar();
  } catch (erro) {
    erroBanco = erro;
    console.error("[DB] Erro no pedroModel.listar():", erro);
  }

  // 2) carrega JSONs locais SEM depender do banco
  const mapaLocal = await carregarJsonLocal();

  // CASO 1: banco falhou ou não tem registros, mas temos JSONs
  if ((!resultadoBanco || resultadoBanco.length === 0) && mapaLocal.size > 0) {
    console.warn("[API] Banco falhou ou vazio; respondendo APENAS com JSON local");

    const listaSomenteJson = Array.from(mapaLocal.values()).map((jsonLocal) => {
      const raw  = jsonLocal.raw_metrics  || {};
      const risk = jsonLocal.risk_model   || {};
      const meds = jsonLocal.medianas     || {};
      const hist = jsonLocal.historico_7d || {};

      return {
        machine_id: jsonLocal.machine_id,
        company: jsonLocal.company,
        status: jsonLocal.status || "ok",
        last_update: jsonLocal.last_update || null,
        raw_metrics: raw,
        ui: { location: "Local não informado" },
        risk_model: risk,
        medianas: meds,
        regressao_risco: jsonLocal.regressao_risco || null,
        historico_7d: hist
      };
    });

    return res.status(200).json(listaSomenteJson);
  }

  // CASO 2: banco ok (tem linhas); tenta casar banco + JSON
  if (resultadoBanco && resultadoBanco.length > 0) {
    const listaFinal = resultadoBanco.map((row) => {
      // normaliza empresa do banco (Tech Solutions -> Tech_Solutions)
      const empresaNorm = row.empresa.replace(/ /g, "_");
      const cod = row.codigo;

      const chave = `${empresaNorm}#${cod}`;
      const jsonLocal = mapaLocal.get(chave);

      if (jsonLocal) {
        console.log(`[MATCH] Encontrado JSON local para ${chave}`);

        const raw  = jsonLocal.raw_metrics  || {};
        const risk = jsonLocal.risk_model   || {};
        const meds = jsonLocal.medianas     || {};
        const hist = jsonLocal.historico_7d || {};

        return {
          machine_id: jsonLocal.machine_id,
          company: jsonLocal.company,
          status: jsonLocal.status || "ok",
          last_update: jsonLocal.last_update || null,
          raw_metrics: raw,
          ui: { location: row.location },
          risk_model: risk,
          medianas: meds,
          regressao_risco: jsonLocal.regressao_risco || null,
          historico_7d: hist
        };
      } else {
        console.log(`[MISS] Sem JSON local para ${chave} — usando fallback do banco`);

        return {
          machine_id: cod,
          company: row.empresa,
          status: "ok",
          location: row.location,
          lat: parseFloat(row.latitude),
          lng: parseFloat(row.longitude),
          cpu: 0,
          ram: 0,
          disk: 0,
          temp: 0,
          uptime: 0
        };
      }
    });

    return res.status(200).json(listaFinal);
  }

  // CASO 3: nem banco nem JSON (aí sim 500, porque não tem dado nenhum)
  console.error("[API] Sem dados no banco e sem JSON local.");
  if (erroBanco) {
    return res.status(500).json(erroBanco.sqlMessage || "Erro de banco sem dados locais.");
  }
  return res.status(500).json("Nenhum dado disponível.");
}

module.exports = {
  listar
};

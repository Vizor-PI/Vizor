var pedroModel = require("../models/pedroModel");
const fs = require("fs");
const path = require("path");

// Caminho fixo da pasta onde estão os JSONs locais
const JSON_DIR = path.join(__dirname, "..", "..", "public", "assets", "json");

/**
 * Carrega todos os .json dentro de /assets/json
 */
async function carregarJsonLocal() {
  let arquivos = [];

  try {
    arquivos = await fs.promises.readdir(JSON_DIR);
  } catch (err) {
    console.error("[LOCAL] Erro ao ler pasta JSON:", err.message);
    return new Map();
  }

  const jsonFiles = arquivos.filter((f) => f.endsWith(".json"));
  console.log("[LOCAL] JSONs encontrados:", jsonFiles.length);

  const mapa = new Map();

  for (const file of jsonFiles) {
    try {
      const fullPath = path.join(JSON_DIR, file);
      const texto = await fs.promises.readFile(fullPath, "utf8");
      const json = JSON.parse(texto);

      const empresa = (json.company || "N/A").replace(/ /g, "_");
      const codigo = json.machine_id;

      const chave = `${empresa}#${codigo}`;
      mapa.set(chave, json);

    } catch (err) {
      console.error(`[LOCAL] Falha ao ler ${file}:`, err.message);
    }
  }

  return mapa;
}

async function listar(req, res) {
  try {
    const resultado = await pedroModel.listar();

    if (resultado.length === 0) {
      return res.status(204).send("Nenhum resultado encontrado no Banco!");
    }

    // Carrega JSONs locais
    const mapaLocal = await carregarJsonLocal();

    const listaFinal = resultado.map((row) => {
      const empresaNorm = row.empresa.replace(/ /g, "_");
      const cod = row.codigo;

      const chave = `${empresaNorm}#${cod}`;
      const jsonLocal = mapaLocal.get(chave);

      if (jsonLocal) {
        console.log(`[MATCH] Encontrado JSON local para ${chave}`);

        return {
          machine_id: jsonLocal.machine_id,
          company: jsonLocal.company,
          status: jsonLocal.status,
          last_update: jsonLocal.last_update,
          raw_metrics: jsonLocal.raw_metrics,
          ui: { location: row.location },
          risk_model: jsonLocal.risk_model,
          medianas: jsonLocal.medianas,
          regressao_risco: jsonLocal.regressao_risco,
          historico_7d: jsonLocal.historico_7d
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

    res.status(200).json(listaFinal);

  } catch (erro) {
    console.log(erro);
    return res.status(500).json(erro.sqlMessage || "Erro interno");
  }
}

module.exports = {
  listar
};

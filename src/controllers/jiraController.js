const jiraService = require('../services/jiraService');
const s3Service = require('../services/s3Service'); 

async function listarChamados(req, res) {
  try {
    const chamados = await jiraService.getRequests();
    res.json(chamados);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar chamados" });
  }
}

async function metricas(req, res) {
  try {
    const stats = await jiraService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error("Erro ao calcular métricas:", err);
    res.status(500).json({ error: "Erro ao calcular métricas" });
  }
}

// <--- NOVA FUNÇÃO --->
async function listarAvisos(req, res) {
  try {
    const avisos = await s3Service.listarAvisos();
    res.json(avisos);
  } catch (err) {
    console.error("Erro ao buscar avisos:", err);
    // Retorna array vazio em caso de erro para não quebrar o front
    res.json([]); 
  }
}

module.exports = { listarChamados, metricas, listarAvisos };
const jiraService = require('../services/jiraService');

// Endpoint para listar chamados recentes
exports.listarChamados = async (req, res) => {
  try {
    const issues = await jiraService.getRequests();
    res.status(200).json({ total: issues.length, issues });
  } catch (err) {
    console.error("Erro ao buscar chamados:", err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao buscar chamados do Jira' });
  }
};

// Endpoint para retornar métricas de incidentes
exports.metricas = async (req, res) => {
  try {
    const stats = await jiraService.getIssueStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error("Erro ao buscar métricas:", err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao buscar métricas do Jira' });
  }
};

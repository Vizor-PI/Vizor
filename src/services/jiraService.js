const axios = require('axios');
require('dotenv').config();

const jira = axios.create({
  baseURL: process.env.JIRA_BASE_URL + '/rest/servicedeskapi',
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN
  },
  headers: {
    'Accept': 'application/json'
  }
});

// ============================================
// 1. FUNÇÃO PRINCIPAL — LISTAR CHAMADOS (JSM)
// ============================================
async function getRequests() {
  try {
    const response = await jira.get('/request', { params: { limit: 50 } });
    return response.data.values; // lista de chamados
    
  } catch (err) {
    console.error("Erro ao buscar chamados do Jira:", err.response?.data || err.message);
    throw err;
  }
}

// ============================================
// 2. MÉTRICAS — TOTAL ABERTOS / FECHADOS / ETC
// ============================================
async function getIssueStats() {
  try {
    const requests = await getRequests();

    let stats = {
      aberto: 0,
      fechado: 0,
      andamento: 0
    };

    requests.forEach((req) => {
      const status = req.currentStatus.status.toLowerCase();

      if (status.includes("pendente") || status.includes("new") || status.includes("to do")) {
        stats.aberto++;
      } 
      else if (status.includes("done") || status.includes("closed") || status.includes("resolvido")) {
        stats.fechado++;
      }
      else {
        stats.andamento++;
      }
    });

    return stats;
  } catch (err) {
    console.error("Erro ao gerar métricas do Jira:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { getRequests, getIssueStats };

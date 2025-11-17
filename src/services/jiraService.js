const axios = require('axios');
require('dotenv').config();

const jira = axios.create({
  baseURL: process.env.JIRA_BASE_URL + '/rest/api/3',
  auth: {
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN
  },
  headers: {
    'Accept': 'application/json'
  }
});

// Buscar chamados recentes (por exemplo, últimos 10)
async function getRecentIssues() {
  try {
    const jql = 'ORDER BY created DESC';
    const response = await jira.get('/search', {
      params: { jql, maxResults: 10 }
    });
    return response.data.issues;
  } catch (error) {
    console.error('Erro ao buscar issues do Jira:', error.message);
    throw error;
  }
}

// Buscar métricas gerais (exemplo: total por status)
async function getIssueStats() {
  try {
    const jql = 'ORDER BY created DESC';
    const response = await jira.get('/search', { params: { jql, maxResults: 100 } });
    const issues = response.data.issues;

    const stats = { aberto: 0, fechado: 0, andamento: 0 };
    issues.forEach(issue => {
      const status = issue.fields.status.name.toLowerCase();
      if (status.includes('open') || status.includes('to do')) stats.aberto++;
      else if (status.includes('done') || status.includes('closed')) stats.fechado++;
      else stats.andamento++;
    });

    return stats;
  } catch (error) {
    console.error('Erro ao calcular métricas do Jira:', error.message);
    throw error;
  }
}

module.exports = { getRecentIssues, getIssueStats };

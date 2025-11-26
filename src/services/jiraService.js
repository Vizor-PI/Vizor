const axios = require('axios');
require('dotenv').config();

// Configuração do cliente Axios para conectar ao Jira
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

/**
 * Busca a lista de chamados (requests) no Jira Service Management.
 * Inclui o parâmetro 'expand: sla' para trazer detalhes de SLA.
 */
async function getRequests() {
  try {
    const response = await jira.get('/request', { 
      params: { 
        limit: 200,
        expand: 'sla' 
      } 
    });
    // Retorna apenas a lista de valores (chamados)
    return response.data.values;
    
  } catch (err) {
    // Em caso de erro, logamos detalhes úteis para debug
    console.error("Erro ao buscar chamados do Jira:", err.response?.data || err.message);
    throw err;
  }
}

/**
 * Calcula as métricas para o Dashboard (KPIs) com base nos chamados retornados.
 * Retorna: Quantidade de Abertos, Fechados, Tempo Médio de Resolução e % de SLA Cumprido.
 */
async function getDashboardStats() {
  // 1. Busca todos os chamados
  const reqs = await getRequests();

  // Variáveis acumuladoras para as estatísticas
  let totalAbertos = 0;
  let totalFechados = 0;
  
  let somaTemposHoras = 0; // Soma total das horas gastas nos chamados fechados
  let qtdChamadosComTempo = 0; // Quantos chamados entraram no cálculo de tempo

  let slaCumprido = 0; // Quantos SLAs foram atendidos (não violados)
  let slaTotal = 0;    // Total de ciclos de SLA avaliados

  // 2. Percorre cada chamado para classificar e calcular
  reqs.forEach(chamado => {
    
    // Normaliza o status para minúsculo para facilitar a comparação
    const statusAtual = chamado.currentStatus.status.toLowerCase();

    // Lista de palavras que indicam que o chamado está encerrado
    const palavrasChaveFechado = ["done", "closed", "resolvido", "concluído", "finalizado"];
    
    // Verifica se o status atual contém alguma das palavras-chave
    // O método .some() retorna true se pelo menos uma condição for verdadeira
    const estaFechado = palavrasChaveFechado.some(palavra => statusAtual.includes(palavra));

    if (estaFechado) {
      totalFechados++;

      // --- CÁLCULO DE TEMPO DE RESOLUÇÃO ---
      
      // Tenta obter a data de finalização. 
      // A API pode retornar 'completedDate' ou a data da mudança de status atual.
      let dataFimString = null;

      if (chamado.completedDate) {
        dataFimString = chamado.completedDate;
      } else if (chamado.currentStatus.statusDate) {
        // statusDate pode vir como objeto com epochMillis
        dataFimString = chamado.currentStatus.statusDate.epochMillis; 
      }

      // Se tivermos data de criação e data de fim, podemos calcular a diferença
      if (chamado.createdDate && dataFimString) {
         
         // Garante que as datas sejam objetos Date válidos
         // O createdDate também pode vir com .epochMillis
         const dataInicio = new Date(chamado.createdDate.epochMillis || chamado.createdDate);
         const dataFim = new Date(dataFimString);
         
         // Calcula a diferença em milissegundos
         const diferencaEmMs = dataFim - dataInicio;

         // Se a diferença for válida (positiva)
         if (diferencaEmMs > 0) {
             // Converte ms para horas (1 hora = 3.600.000 ms)
             const horas = diferencaEmMs / 3600000;
             
             somaTemposHoras += horas;
             qtdChamadosComTempo++;
         }
      }

    } else {
      // Se não está fechado, conta como aberto
      totalAbertos++;
    }

    // --- CÁLCULO DE SLA ---
    
    // Verifica se existe informação de SLA no chamado
    if (chamado.sla) {
        
        // Caso 1: SLA é um objeto único com propriedade 'outcome'
        if (chamado.sla.outcome) {
            slaTotal++;
            // Se o resultado não for 'FAILED', consideramos cumprido
            if (chamado.sla.outcome !== "FAILED") {
                slaCumprido++;
            }
        } 
        // Caso 2: SLA é uma lista (array) de vários ciclos
        else if (Array.isArray(chamado.sla)) {
            chamado.sla.forEach(cicloSla => {
                slaTotal++;
                if (cicloSla.outcome !== "FAILED") {
                    slaCumprido++;
                }
            });
        }
    }
  });

  // 3. Calcula as médias finais para retorno

  // Tempo Médio: Soma das horas / Quantidade de chamados calculados
  let tempoMedioFinal = 0;
  if (qtdChamadosComTempo > 0) {
      tempoMedioFinal = somaTemposHoras / qtdChamadosComTempo;
  }

  // Porcentagem de SLA: (Cumpridos / Total) * 100
  // Se não houver SLAs, assume 100% para não mostrar 0% incorretamente
  let porcentagemSla = "100";
  if (slaTotal > 0) {
      const calculo = (slaCumprido / slaTotal) * 100;
      porcentagemSla = calculo.toFixed(0); // Arredonda para inteiro (ex: "95")
  }

  // Retorna o objeto pronto para o Controller
  return {
    aberto: totalAbertos,
    fechado: totalFechados,
    tempoMedio: tempoMedioFinal.toFixed(1), // Ex: "2.5"
    sla: porcentagemSla
  };
}

module.exports = { getRequests, getDashboardStats };
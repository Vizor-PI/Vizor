var database = require("../database/config");

function listarDados(id) {
  console.log("ACESSEI O AVISO  MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listarDados()");
  var instrucaoSql = `
        SELECT 
    m.nome AS modelo,
    GROUP_CONCAT(CONCAT(c.nome, ': ', mc.especificacao) SEPARATOR ', ') AS componentes,
    l.dataFabricacao
FROM usuario u
JOIN empresa e ON u.fkEmpresa = e.id
JOIN lote l ON l.fkEmpresa = e.id
JOIN modelo m ON l.fkModelo = m.id
JOIN modelo_componente mc ON m.id = mc.fkModelo
JOIN componente c ON mc.fkComponente = c.id
WHERE u.id = ${id} 
GROUP BY m.id, l.dataFabricacao;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarModelos(id) {
  console.log("Acessei o model listarModelos")
  var instrucaoSql =
    `
   SELECT 
    m.nome AS modelo,
    GROUP_CONCAT(CONCAT(c.nome, ': ', mc.especificacao) SEPARATOR ', ') AS componentes,
    l.dataFabricacao
FROM usuario u
JOIN empresa e ON u.fkEmpresa = e.id
JOIN lote l ON l.fkEmpresa = e.id
JOIN modelo m ON l.fkModelo = m.id
JOIN modelo_componente mc ON m.id = mc.fkModelo
JOIN componente c ON mc.fkComponente = c.id
WHERE u.id = ${id} 
GROUP BY m.id, l.dataFabricacao;
  `
  console.log("Executando a instrução SQL")
  return database.executar(instrucaoSql);
}




module.exports = {
  listarDados,
  listarModelos
}


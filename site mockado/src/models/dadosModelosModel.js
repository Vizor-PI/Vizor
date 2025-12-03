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
    m.id AS id,
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

function listarTodosModelos(id) {
  console.log("Acessei o model listarTodosModelos (para Criar Lote)");

  var instrucaoSql =
    `
   SELECT 
    m.id AS id,
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

function listarModelosELotes(idUsuario) {
  // Retorna modelos e lotes permitidos para o usuário
  if (!idUsuario) {
        console.error("ERRO CRÍTICO: idUsuario é undefined ou null em listarModelosELotes. Retornando array vazio.");
        return Promise.resolve([]);
    }

    // [CORREÇÃO] Adicionado JOIN com miniComputador para pegar o 'codigo' (ex: COD004)
    // Sem o código, o sistema não consegue achar a pasta no S3.
    var instrucaoSql = `
        SELECT 
            mc.codigo AS codigo,
            m.nome AS modelo,
            l.id AS lote
        FROM usuario u
        JOIN empresa e ON u.fkEmpresa = e.id
        JOIN lote l ON l.fkEmpresa = e.id
        JOIN modelo m ON l.fkModelo = m.id
        JOIN miniComputador mc ON mc.fkLote = l.id
        WHERE u.id = ${idUsuario}
    `;
    
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
   
}


module.exports = {
  listarDados,
  listarModelos,
  listarTodosModelos,
  listarModelosELotes 
}
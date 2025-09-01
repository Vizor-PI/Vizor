var database = require("../database/config");

function listarDados(id) {
  console.log("ACESSEI O usuario MODEL \n\n >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n >> verifique suas credenciais de acesso ao banco\n >> e se o servidor de seu BD está rodando corretamente.\n\n function listarDados()");

  var instrucaoSql = `
        SELECT 
            us.nome       AS NomeUsuario, 
            us.email      AS EmailUsuario, 
            us.telefone   AS Telefone, 
            us.cpf        AS CPF, 
            us.senha      AS SenhaUsuario,
            em.nome       AS NomeEmpresa,
            cg.titulo     AS Cargo
        FROM usuario AS us
        INNER JOIN empresa AS em 
            ON us.fkEmpresa = em.id
        INNER JOIN cargo AS cg
            ON us.fkCargo = cg.id
        WHERE us.id = ${id};
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarUsuarios() {
  console.log("Acessei o model listarUsuarios");

  var instrucaoSql = `
        SELECT 
            us.nome       AS NomeUsuario, 
            us.email      AS EmailUsuario, 
            us.telefone   AS Telefone, 
            us.cpf        AS CPF, 
            us.senha      AS SenhaUsuario,
            em.nome       AS NomeEmpresa,
            cg.titulo     AS Cargo
        FROM usuario AS us
        INNER JOIN empresa AS em 
            ON us.fkEmpresa = em.id
        INNER JOIN cargo AS cg
            ON us.fkCargo = cg.id;
    `;
  console.log("Executando a instrução SQL");
  return database.executar(instrucaoSql);
}

module.exports = {
  listarDados,
  listarUsuarios
}

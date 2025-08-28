var database = require("../database/config");

function listarDados(id) {
  console.log("ACESSEI O AVISO  MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listarDados()");
  var instrucaoSql = `
        SELECT us.nome as NomeUsuario, us.email as EmailUsuario, us.telefone as Telefone, em.nome as NomeEmpresa,us.cpf as CPF
        FROM usuario AS us
        INNER JOIN empresa AS em on us.fkEmpresa = em.id WHERE us.id = '${id}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}module.exports = {
  listarDados
}


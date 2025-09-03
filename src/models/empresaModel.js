var database = require("../database/config");

function buscarDadosEmpresa() {
  var instrucaoSql = `SELECT id as IdEmpresa, nome as NomeEmpresa, codigoAtivacao as Codigo FROM empresa;`;

  return database.executar(instrucaoSql);
}

function cadastrar(nome, cnpj, codigo) {
  console.log(
    "ACESSEI O EMPRESA MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    cnpj,
    codigo
  );
  var instrucaoSql = `
        INSERT INTO empresa (nome, cnpj, codigoAtivacao) VALUES ('${nome}', '${cnpj}', '${codigo}');
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

module.exports = {
  buscarDadosEmpresa,
  cadastrar,
};

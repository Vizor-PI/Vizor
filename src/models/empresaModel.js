var database = require("../database/config");

function buscarDadosEmpresa() {
  var instrucaoSql = `SELECT id as IdEmpresa, nome as NomeEmpresa, codigoAtivacao as Codigo FROM empresa;`;

  return database.executar(instrucaoSql);
}

module.exports = {buscarDadosEmpresa};

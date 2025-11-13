var database = require("../database/config");

function listarDados(id) {
  console.log("ACESSEI O AVISO  MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function listarDados()");
  var instrucaoSql = `
        SELECT mo.nome as NomeModelo, co.nome as Componente, mc.especificacao as Especificacoes, lo.dataFabricacao as DataFabricacao
        FROM modelo AS mo
        INNER JOIN componente AS co on mo.fkComponente = co.id;
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function listarModelos(codigo) {
  console.log("Acessei o model listarModelos")
  var instrucaoSql =
    `
   SELECT us.id, us.nome as NomeModelo, us.email as EmailModelo, us.telefone as Telefone, us.cpf as CPF, us.senha as SenhaModelo , car.titulo 
  FROM Modelo us
  INNER JOIN cargo car ON car.id = us.fkCargo
  INNER JOIN empresa emp ON emp.id = us.fkEmpresa
  WHERE us.fkcargo = car.id AND codigoAtivacao = '${codigo}';
  `
  console.log("Executando a instrução SQL")
  return database.executar(instrucaoSql);
}

function listarCargos() {
  console.log("Acessei o model listarCargos")
  var instrucaoSql =
    `
SELECT id as idCargo, titulo FROM cargo;
`
  return database.executar(instrucaoSql);
}

module.exports = {
  listarDados,
  listarModelos,
  listarCargos
}


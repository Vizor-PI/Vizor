var database = require("../database/config");

function autenticar(email, senha) {
  console.log(
    "ACESSEI O Modelo MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    email,
    senha
  );
  var instrucaoSql = `
        SELECT us.id, us.nome, us.email, empresa.codigoAtivacao, us.fkcargo 
        FROM Modelo AS us INNER JOIN empresa ON empresa.id = us.fkEmpresa 
        WHERE email = '${email}' AND senha = '${senha}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha, cpf, telefone, codigoEmpresa, cargo) {
  console.log(
    "ACESSEI O Modelo MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    email,
    senha,
    cpf,
    telefone,
    cargo
  );

  // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
  //  e na ordem de inserção dos dados.
  var instrucaoSql = `
    INSERT INTO Modelo (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) VALUES 
        (
            '${nome}',
            '${email}',
            '${senha}',
            '${cpf}',
            '${telefone}',
            (SELECT id FROM empresa WHERE codigoAtivacao = '${codigoEmpresa}'), 
            '${cargo}'
        );
`;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function atualizar(email, senha, senhaNova, Modelo) {
  console.log(
    "ACESSEI O Modelo MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function atualizar(): ",
    email,
    senha,
    senhaNova,
    Modelo
  );
  var instrucaoSql = `
        UPDATE Modelo 
        SET senha = '${senhaNova}' 
        WHERE email = '${email}' AND senha = '${senha}' AND nome = '${Modelo}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function atualizarModelos(email, telefone, cargo, id) {
  console.log("Executando a instrução atualizar Modelos");
  var instrucaoSql = `
    UPDATE Modelo
    SET email = "${email}", telefone = "${telefone}", fkCargo = "${cargo}"
    WHERE id = ${id};
    `;
  return database.executar(instrucaoSql);
}

function deletarModelo(id, ) {
  console.log("Executando a instrução deletar Modelos");
  var instrucaoSql1 = `
DELETE FROM lote 
innerjoin modeloWHERE id = ${id};
`;
var instrucaoSql2 = `
DELETE FROM modelo WHERE id = ${id};
`;
  var instrucaoSql = `
DELETE FROM modelo WHERE id = ${id};
`;
  console.log(instrucaoSql);
  return database.executar(instrucaoSql);
}
module.exports = {
  autenticar,
  cadastrar,
  atualizar,
  atualizarModelos,
  deletarModelo,
};

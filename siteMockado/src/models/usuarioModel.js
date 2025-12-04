var database = require("../database/config");

function autenticar(email, senha) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ",
    email,
    senha
  );
  var instrucaoSql = `
        SELECT us.id, us.nome, us.email, empresa.codigoAtivacao, us.fkcargo, empresa.id as idEmpresa, empresa.nome AS nomeEmpresa 
        FROM usuario AS us INNER JOIN empresa ON empresa.id = us.fkEmpresa 
        WHERE email = '${email}' AND senha = '${senha}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}

function cadastrar(nome, email, senha, cpf, telefone, codigoEmpresa, cargo) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():",
    nome,
    email,
    senha,
    cpf,
    telefone,
    cargo
  );

  var instrucaoSql = `
    INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) VALUES 
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

function atualizar(email, senha, senhaNova, usuario) {
  console.log(
    "ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function atualizar(): ",
    email,
    senha,
    senhaNova,
    usuario
  );
  var instrucaoSql = `
        UPDATE usuario 
        SET senha = '${senhaNova}' 
        WHERE email = '${email}' AND senha = '${senha}' AND nome = '${usuario}';
    `;
  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.executar(instrucaoSql);
}
function atualizarUsuarios(email, telefone, cargo, id) {
  console.log("Executando a instrução atualizar usuarios");
  var instrucaoSql = `
    UPDATE usuario
    SET email = "${email}", telefone = "${telefone}", fkCargo = "${cargo}"
    WHERE id = ${id};
    `;
  return database.executar(instrucaoSql);
}

function deletarUsuario(id) {
  console.log("Executando a instrução deletar usuarios");
  var instrucaoSql = `
DELETE FROM usuario WHERE id = ${id};
`;
  console.log(instrucaoSql);
  return database.executar(instrucaoSql);
}
module.exports = {
  autenticar,
  cadastrar,
  atualizar,
  atualizarUsuarios,
  deletarUsuario,
};

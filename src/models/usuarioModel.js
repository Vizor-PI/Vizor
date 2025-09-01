var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
        SELECT id, nome, email FROM usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha, cpf, telefone,codigoEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, cpf, telefone);
    
    // Insira exatamente a query do banco aqui, lembrando da nomenclatura exata nos valores
    //  e na ordem de inserção dos dados.
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa) VALUES ('${nome}', '${email}', '${senha}', '${cpf}', '${telefone}', (SELECT id FROM empresa WHERE codigoAtivacao = '${codigoEmpresa}'));
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(email, senha, senhaNova, usuario) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function atualizar(): ", email, senha, senhaNova, usuario)
    var instrucaoSql = `
        UPDATE usuario 
        SET senha = '${senhaNova}' 
        WHERE email = '${email}' AND senha = '${senha}' AND nome = '${usuario}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}
function atualizarUsuarios(email, telefone, cargo,id){
    console.log("Executando a instrução atualizar usuarios")
    var instrucaoSql = 
    `
    UPDATE usuario
    SET email = "${email}", telefone = "${telefone}", cargo = "${cargo}"
    WHERE id = ${id};
    `
    return database.executar(instrucaoSql);
}
module.exports = {
    autenticar,
    cadastrar,
    atualizar,
    atualizarUsuarios
};
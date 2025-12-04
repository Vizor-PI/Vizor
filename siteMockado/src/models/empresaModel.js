var database = require("../database/config");

function buscarDadosEmpresa() {
  var instrucaoSql = `SELECT id as IdEmpresa, nome as NomeEmpresa, codigoAtivacao as Codigo FROM empresa;`;

  return database.executar(instrucaoSql);
}

function cadastrar(
  nome,
  cnpj,
  codigo,
  cep,
  estado,
  cidade,
  bairro,
  rua,
  numero
) {
  console.log("ACESSEI O EMPRESA MODEL - Iniciando cadastro em cascata...");

  const instrucaoEstado = `INSERT INTO estado (nome) VALUES ('${estado}');`;
  console.log("Executando SQL para Estado: \n" + instrucaoEstado);

  return database
    .executar(instrucaoEstado)
    .then(function (resultadoEstado) {
      const idEstado = resultadoEstado.insertId;
      console.log("ID do Estado inserido:", idEstado);

      const instrucaoCidade = `INSERT INTO cidade (nome, fkEstado) VALUES ('${cidade}', ${idEstado});`;
      console.log("Executando SQL para Cidade: \n" + instrucaoCidade);

      return database.executar(instrucaoCidade);
    })
    .then(function (resultadoCidade) {
      const idCidade = resultadoCidade.insertId;
      console.log("ID da Cidade inserida:", idCidade);

      const instrucaoEndereco = `INSERT INTO endereco (rua, numero, cep, bairro, fkCidade) VALUES ('${rua}', '${numero}', '${cep}', '${bairro}', ${idCidade});`;
      console.log("Executando SQL para Endereço: \n" + instrucaoEndereco);

      return database.executar(instrucaoEndereco);
    })
    .then(function (resultadoEndereco) {
      const idEndereco = resultadoEndereco.insertId;
      console.log("ID do Endereço inserido:", idEndereco);

      const instrucaoEmpresa = `INSERT INTO empresa (nome, cnpj, codigoAtivacao, fkEndereco) VALUES ('${nome}', '${cnpj}', '${codigo}', ${idEndereco});`;
      console.log("Executando SQL para Empresa: \n" + instrucaoEmpresa);

      return database.executar(instrucaoEmpresa);
    });
}

module.exports = {
  buscarDadosEmpresa,
  cadastrar,
};

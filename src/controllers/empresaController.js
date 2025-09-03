var empresaModel = require("../models/empresaModel");

function buscarDadosEmpresa(req, res) {
  empresaModel.buscarDadosEmpresa().then((resultado) => {
    res.status(200).json(resultado);
  });
}

function cadastrar(req, res) {
  var nome = req.body.nomeServer;
  var cnpj = req.body.cnpjServer;
  var codigo = req.body.codigoServer;

  if (nome == undefined) {
    res.status(400).send("Seu nome está undefined!");
  } else if (cnpj == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (codigo == undefined) {
    res.status(400).send("Sua senha está undefined!");
  } else {
    empresaModel
      .cadastrar(nome, cnpj, codigo)
      .then(function (resultado) {
        res.json(resultado);
      })
      .catch(function (erro) {
        console.log(erro);
        console.log(
          "\nHouve um erro ao realizar o cadastro! Erro: ",
          erro.sqlMessage
        );
        res.status(500).json(erro.sqlMessage);
      });
  }
}

module.exports = {
  buscarDadosEmpresa,
  cadastrar,
};

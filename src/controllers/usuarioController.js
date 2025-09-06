var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;

  if (email == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está indefinida!");
  } else {
    usuarioModel
      .autenticar(email, senha)
      .then(function (resultadoAutenticar) {
        if (resultadoAutenticar.length == 1) {
          res.json({
            id: resultadoAutenticar[0].id,
            email: resultadoAutenticar[0].email,
            nome: resultadoAutenticar[0].nome,
            codigoAtivacao: resultadoAutenticar[0].codigoAtivacao,
            fkpermissao: resultadoAutenticar[0].fkpermissao,
            codigocargo: resultadoAutenticar[0].fkcargo,
          });
        } else {
          res.status(403).send("Email e/ou senha inválido(s)");
        }
      })
      .catch(function (erro) {
        res.status(500).json(erro.sqlMessage);
      });
  }
}

function cadastrar(req, res) {
  // Crie uma variável que vá recuperar os valores do arquivo cadastro.html
  var nome = req.body.nomeServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;
  var cpf = req.body.cpfServer;
  var telefone = req.body.telefoneServer;
  var codigoEmpresa = req.body.codigoEmpresa;
  var cargo = req.body.cargoServer;

  // Faça as validações dos valores
  if (nome == undefined) {
    res.status(400).send("Seu nome está undefined!");
  } else if (email == undefined) {
    res.status(400).send("Seu email está undefined!");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está undefined!");
  } else if (cpf == undefined) {
    res.status(400).send("Seu CPF está undefined!");
  } else if (telefone == undefined) {
    res.status(400).send("Seu telefone está undefined!");
  } else if (codigoEmpresa == undefined) {
    res.status(400).send("Empresa não encontrada");
  } else if (cargo == undefined) {
    res.status(400).send("Cargo está undefinied!");
  } else {
    // Passe os valores como parâmetro e vá para o arquivo usuarioModel.js
    usuarioModel
      .cadastrar(nome, email, senha, cpf, telefone, codigoEmpresa, cargo)
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

function atualizar(req, res) {
  var usuario = req.body.usuarioServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;
  var senhaNova = req.body.senhaNovaServer;

  if (email == undefined) {
    res.status(400).send("Seu email está indefindo");
  } else if (senha == undefined) {
    res.status(400).send("Sua senha está indefinida!");
  } else if (senhaNova == undefined) {
    res.status(400).send("Sua senha nova está indefinida!");
  } else if (usuario == undefined) {
    res.status(400).send("Seu usuário está indefinido");
  } else {
    usuarioModel
      .atualizar(email, senha, senhaNova, usuario)
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

function atualizarUsuario(req, res) {
  var id = req.params.id;
  var email = req.body.emailServer;
  var telefone = req.body.telefoneServer;
  var cargo = req.body.cargoServer;

  usuarioModel
    .atualizarUsuarios(email, telefone, cargo, id)
    .then(function (resultado) {
      res.json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("Houve um erro ao atualizar os dados");
      res.status(500).json(erro.sqlMessage);
    });
}

function deletarUsuario(req, res) {
  var id = req.params.id;
  usuarioModel
    .deletarUsuario(id)
    .then(function (resultado) {
      res.json(resultado);
    })
    .catch(function (erro) {
      console.log(erro);
      console.log("Houve um erro ao deletar o usuário");
      res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
  autenticar,
  cadastrar,
  atualizar,
  atualizarUsuario,
  deletarUsuario,
};

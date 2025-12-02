var dadosModeloModel = require("../models/dadosModelosModel.js");

function listarDados(req, res) {
    var id = req.params.id;
    dadosModeloModel.listarDados(id).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } 
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os dados: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function listarModelos(req,res){
    let id = req.body.id;

    dadosModeloModel.listarModelos(id).then(function (resultado){
        if(resultado.length > 0){
            res.status(200).json(resultado);
        } 
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao buscar os dados: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function listarTodosModelos(req, res){
    dadosModeloModel.listarTodosModelos().then(function (resultado){
        if(resultado.length > 0){
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum modelo cadastrado")
        }
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao buscar todos os modelos: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

async function listarModelosELotes(req, res) {
  const id = req.params.id;
  try {
    const result = await dadosModeloModel.listarModelosELotes(id); // <-- ajuste aqui
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send("Erro ao listar modelos e lotes");
  }
}

module.exports = {
    listarDados,
    listarModelos,
    listarTodosModelos,
    listarModelosELotes
}
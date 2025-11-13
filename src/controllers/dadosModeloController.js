var dadosModeloModel = require("../models/dadosModelosModel.js");

function listarDados(req, res) {
    var id = req.params.id;
    dadosModeloModel.listarDados(id).then(function (resultado) {
        if (resultado.length > 0) {
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum dado encontrado!")
        }
    }).catch(function (erro) {
        console.log(erro);
        console.log("Houve um erro ao buscar os dados: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

function listarModelos(req,res){
    let id = req.params.id;

    dadosModeloModel.listarModelos(id).then(function (resultado){
        if(resultado.length > 0){
            res.status(200).json(resultado);
        } else {
            res.status(204).send("Nenhum dado encontrado")
        }
    }).catch(function (erro){
        console.log(erro);
        console.log("Houve um erro ao buscar os dados: ", erro.sqlMessage);
        res.status(500).json(erro.sqlMessage);
    });
}

module.exports = {
    listarDados,
    listarModelos
}
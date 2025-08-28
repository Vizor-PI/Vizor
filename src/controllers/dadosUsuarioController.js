var dadosUsuarioModel = require("../models/dadosUsuarioModel.js");

function listarDados(req, res) {
    var id = req.params.id;
    dadosUsuarioModel.listarDados(id).then(function (resultado) {
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


module.exports = {
    listarDados
}
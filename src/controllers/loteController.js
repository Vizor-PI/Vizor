var loteModel = require("../models/loteModel");

function buscarLote(req, res) {
    loteModel.buscarLote(req)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.error(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarLote
}
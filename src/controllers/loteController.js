var loteModel = require("../models/loteModel");

function buscarLote(req, res) {
    var idUsuario = req.body.idUsuarioServer; 

    if (idUsuario == undefined) {
        res.status(400).send("ID do usuário não foi enviado!");
        return;
    }

    loteModel.buscarLote(idUsuario)
        .then(resultado => {
            if (!resultado) {
                console.error("Resultado do Model veio vazio/nulo.");
                res.status(500).send("Erro interno ao processar a consulta.");
                return;
            }
            if (resultado.length == 0) {
                res.status(200).json([]);
            } else {
                res.status(200).json(resultado);
            }
        })
        .catch(erro => {
            console.error("Erro ao buscar lotes:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletarLote(req, res) {
    var idLote = req.params.idLote;

    if (idLote == undefined) {
        res.status(400).send("ID do Lote não foi enviado!");
        return;
    }

    loteModel.deletarLote(idLote)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao deletar o lote");
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarLote,
    deletarLote
}
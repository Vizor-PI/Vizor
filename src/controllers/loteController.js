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

function cadastrar(req, res) {
    var idLote = req.body.idLoteServer;
    var data = req.body.dataServer;
    var qtd = req.body.qtdServer;
    var modelo = req.body.fkModelo || req.body.modeloServer;
    var codigoEmpresa = req.body.codigoEmpresa;

    if (idLote == undefined || data == undefined || qtd == undefined || modelo == undefined || codigoEmpresa == undefined) {
        res.status(400).send("Todos os campos devem ser preenchidos!");
        return;
    }
    if (isNaN(idLote) || isNaN(qtd) || parseInt(qtd) <= 0) {
        res.status(400).send("ID e Quantidade devem ser números positivos.");
        return;
    }

    loteModel.cadastrar(idLote, data, qtd, modelo, codigoEmpresa)
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            if (erro.errno === 1062) {
                 res.status(409).send("O ID do Lote já existe. Por favor, utilize outro ID.");
                 return;
            }
            console.log("\nHouve um erro ao cadastrar o lote! Erro: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    buscarLote,
    deletarLote,
    cadastrar
}
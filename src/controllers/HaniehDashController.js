const model = require("../models/HaniehDashModel");

async function getKpis(req, res) {
    const { start, end } = req.query;


    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }


    try {
        const resultado = await model.getKpis(start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter KPIs:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao obter KPIs");
    }
}

async function topModels(req, res) {
    const { start, end } = req.query;


    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }


    try {
        const resultado = await model.topModels(start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter modelos críticos:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao obter dados");
    }
}

async function topLotes(req, res) {
    const { start, end } = req.query;


    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }


    try {
        const resultado = await model.topLotes(start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter lotes críticos:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao obter dados");
    }
}

function comparison(req, res) {
    var start = req.query.start;
    var end = req.query.end;
    var type = req.query.type;

    if (type == undefined) {
        res.status(400).send("O tipo do alerta está undefined!");
    } else if (!start || !end) {
        res.status(400).send("O período (start e end) está incompleto!");
    } else {
        model.comparison(start, end, type)
            .then(function (resultado) {
                res.json(resultado[0]);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Houve um erro ao buscar a comparação:", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

async function heatmap(req, res) {
    const { start, end } = req.query;


    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }


    try {
        const resultado = await model.heatmap(start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao gerar heatmap:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao gerar heatmap");
    }
}

async function list(req, res) {
    const { start, end, tipo } = req.query;


    try {
        const resultado = await model.list(start, end, tipo);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao listar modelos e lotes:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao listar dados");
    }
}

async function recommend(req, res) {
    try {
        const resultado = await model.recommend();
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter recomendações:", erro.sqlMessage || erro);
        res.status(500).send(erro.sqlMessage || "Erro ao obter recomendações");
    }
}

function listAlerts(req, res) {
    var type = req.query.type;
    var id = req.query.id;

    if (type == undefined) {
        res.status(400).send("O tipo está undefined!");
    } else if (id == undefined) {
        res.status(400).send("O ID está undefined!");
    } else {
        model.listAlerts(type, id)
            .then(function (resultado) {
                res.json(resultado[0]);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Erro ao listar alertas:", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}
module.exports = {
    getKpis,
    topModels,
    topLotes,
    comparison,
    heatmap,
    list, 
    recommend,
    listAlerts
};
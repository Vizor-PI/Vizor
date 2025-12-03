const model = require("../models/HaniehDashModel");
const model2 = require("../models/dadosModelosModel")
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    region: "us-east-1",
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
});

const CLIENT_BUCKET = "meu-bucket-client";
const OUTPUT_KEY = "alertas-tratado.json";

let cachedAlerts = [];

const localAlerts = require("../tests/alerts.json");

async function syncAlerts(req, res) {
    try {
        // USE LOCAL JSON FOR NOW
        const alerts = localAlerts;

        req._alerts = alerts;

        res.json({
            message: "Test alerts loaded from JSON",
            count: alerts.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to load alerts" });
    }
}


async function getKpis(req, res) {
    const userId = req.query.userId || req.params.userId;
    try {
        const resultado = await model.getKpis(userId); // no start/end
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter KPIs:", erro);
        res.status(500).send("Erro ao obter KPIs");
    }
}

async function topModels(req, res) {
    const { start, end } = req.query;
    const userId = req.query.userId || req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.topModels(userId, start, end); // Passe start e end
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter modelos críticos:", erro);
        res.status(500).send("Erro ao obter dados");
    }
}

async function topLotes(req, res) {
    const { start, end } = req.query;
    const userId = req.query.userId || req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.topLotes(userId, start, end); // <-- ORDEM CORRETA!
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter lotes críticos:", erro);
        res.status(500).send("Erro ao obter dados");
    }
}

async function comparison(req, res) {
    const { start, end, entityType, entity } = req.query;
    const userId = req.query.userId || req.params.userId;

    if (!entityType || !entity) return res.status(400).send("Entidade não selecionada!");
    if (!start || !end) return res.status(400).send("O período está incompleto!");

    try {
        const result = await model.comparison(start, end, entityType, entity, userId);
        return res.status(200).json(result);
    } catch (erro) {
        console.log("Erro ao buscar comparação:", erro);
        return res.status(500).json(erro.sqlMessage || "Erro ao buscar comparação");
    }
}


async function heatmap(req, res) {
    const { start, end } = req.query;
    const userId = req.query.userId || req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.heatmap(start, end, userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao gerar heatmap:", erro);
        res.status(500).send("Erro ao gerar heatmap");
    }
}

async function list(req, res) {
    const { start, end, view, state, order } = req.query;
    const userId = req.query.userId || req.params.userId;

    if ((start && !end) || (!start && end)) {
        return res.status(400).send("É necessário enviar start e end juntos.");
    }

    if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).send("Datas inválidas! Use ISO YYYY-MM-DD.");
        }

        if (startDate > endDate) {
            return res.status(400).send("A data inicial não pode ser maior que a final.");
        }
    }

    try {
        const resultado = await model.list(start, end, view, state, order, userId);
        return res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao listar modelos e lotes:", erro);
        return res.status(500).send("Erro ao listar dados");
    }
}


async function recommend(req, res) {
    const userId = req.query.userId || req.params.userId;

    try {
        const resultado = await model.recommend(userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter recomendações:", erro);
        res.status(500).send("Erro ao obter recomendações");
    }
}

async function listAlerts(req, res) {
    const { type, id } = req.params;  
    const userId = req.query.userId;  
    const start = req.query.start;
    const end = req.query.end;
    const alerts = localAlerts;

    if (!type) return res.status(400).send("Tipo ausente!");
    if (!id) return res.status(400).send("ID ausente!");
    if (!userId) return res.status(400).send("userId ausente!");

    try {
        let permittedAlerts = await model.filtrarPorUsuario(alerts, userId);

        // Apply date filter if present
        if (start) {
            const ini = new Date(start);
            permittedAlerts = permittedAlerts.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            permittedAlerts = permittedAlerts.filter(a => new Date(a.timestamp) <= fim);
        }

        // Now filter by type/id
        const filtrado = permittedAlerts.filter(alert => {
            if (type === "modelo") return alert.modelo && alert.modelo.trim() === id.trim();
            if (type === "lote") return String(alert.lote).trim() === String(id).trim();
            return false;
        });
        return res.status(200).json(filtrado);

    } catch (erro) {
        console.log("Erro ao listar alertas:", erro);
        return res.status(500).send("Erro ao listar alertas");
    }
}


    

module.exports = {
    syncAlerts,
    getKpis,
    topModels,
    topLotes,
    comparison,
    heatmap,
    list,
    recommend,
    listAlerts
};

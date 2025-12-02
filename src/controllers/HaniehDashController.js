const model = require("../models/HaniehDashModel");

async function syncAlerts(req, res) {
    return res.status(200).json({ message: "Sync via S3 OK" });
}

async function getKpis(req, res) {
    const { userId, start, end } = req.query; // [CORREÇÃO] Pega start e end
    const uid = userId || req.params.userId;
    try {
        // [CORREÇÃO] Passa start e end para o model
        const resultado = await model.getKpis(uid, start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro KPI:", erro);
        res.status(500).send("Erro ao obter KPIs");
    }
}

async function topModels(req, res) {
    const { start, end, userId } = req.query;
    try {
        const resultado = await model.topModels(userId, start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro TopModels:", erro);
        res.status(500).send("Erro");
    }
}

async function topLotes(req, res) {
    const { start, end, userId } = req.query;
    try {
        const resultado = await model.topLotes(userId, start, end);
        res.status(200).json(resultado);
    } catch (erro) {
        console.error("Erro TopLotes:", erro);
        res.status(500).send("Erro");
    }
}

async function comparison(req, res) {
    const { start, end, entityType, entity, userId } = req.query;
    try {
        const result = await model.comparison(start, end, entityType, entity, userId);
        res.status(200).json(result);
    } catch (erro) {
        console.error("Erro Comparison:", erro);
        res.status(500).send("Erro");
    }
}

async function heatmap(req, res) {
    const { start, end, userId } = req.query;
    try {
        const result = await model.heatmap(start, end, userId);
        res.status(200).json(result);
    } catch (erro) {
        console.error("Erro Heatmap:", erro);
        res.status(500).send("Erro");
    }
}

async function list(req, res) {
    const { start, end, view, order, userId } = req.query;
    try {
        const result = await model.list(start, end, view, order, userId);
        res.status(200).json(result);
    } catch (erro) {
        console.error("Erro List:", erro);
        res.status(500).send("Erro");
    }
}

async function recommend(req, res) {
    const { userId } = req.query;
    try {
        const result = await model.recommend(userId);
        res.status(200).json(result);
    } catch (erro) {
        console.error("Erro Recommend:", erro);
        res.status(500).send("Erro");
    }
}

async function listAlerts(req, res) {
    const { type, id } = req.params;
    const { userId } = req.query;
    try {
        const allAlerts = await model.listarTodos(userId);
        const filtrado = allAlerts.filter(a => {
            if (type === "modelo") return a.modelo === id;
            if (type === "lote") return a.lote == id;
            return false;
        });
        res.status(200).json(filtrado);
    } catch (erro) {
        console.error("Erro listAlerts:", erro);
        res.status(500).send("Erro");
    }
}

module.exports = {
    syncAlerts, getKpis, topModels, topLotes, comparison, heatmap, list, recommend, listAlerts
};
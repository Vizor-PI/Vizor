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

async function syncAlerts(req, res) {
    try {
        const data = await s3.getObject({
            Bucket: CLIENT_BUCKET,
            Key: OUTPUT_KEY
        }).promise();

        const parsedAlerts = JSON.parse(data.Body.toString("utf-8"));

        return res.status(200).send("S3 alerts fetched successfully.");
    } catch (error) {
        console.error("Erro ao sincronizar alerts:", error);
        return res.status(500).send("Erro ao sincronizar alerts");
    }
}

async function getKpis(req, res) {
    const { start, end } = req.params.query;
    const userId = req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.getKpis(start, end, userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter KPIs:", erro);
        res.status(500).send("Erro ao obter KPIs");
    }
}

async function topModels(req, res) {
    const { start, end } = req.params.query;
    const userId = req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.topModels(start, end, userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter modelos críticos:", erro);
        res.status(500).send("Erro ao obter dados");
    }
}

async function topLotes(req, res) {
    const { start, end } = req.params.query;
    const userId = req.params.userId;

    if (!start || !end) {
        return res.status(400).send("Parâmetros de data ausentes!");
    }

    try {
        const resultado = await model.topLotes(start, end, userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao obter lotes críticos:", erro);
        res.status(500).send("Erro ao obter dados");
    }
}

function comparison(req, res) {
    const { start, end, type } = req.params.query;
    const userId = req.params.userId;

    if (!type) return res.status(400).send("O tipo está vazio!");
    if (!start || !end) return res.status(400).send("O período está incompleto!");

    model.comparison(start, end, type, userId)
        .then(result => res.json(result[0]))
        .catch(erro => {
            console.log("Erro ao buscar comparação:", erro);
            res.status(500).json(erro.sqlMessage);
        });
}

async function heatmap(req, res) {
    const { start, end } = req.params.query;
    const userId = req.params.userId;

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
    const { start, end, tipo } = req.params.query;
    const userId = req.params.userId;

    try {
        const resultado = await model.list(start, end, tipo, userId);
        res.status(200).json(resultado);
    } catch (erro) {
        console.log("Erro ao listar modelos e lotes:", erro);
        res.status(500).send("Erro ao listar dados");
    }
}

async function recommend(req, res) {
    const userId = req.params.userId;

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
    const userId = req.params.userId;

    if (!type) return res.status(400).send("Tipo ausente!");
    if (!id) return res.status(400).send("ID ausente!");

    try {
        
        const data = await s3.getObject({
            Bucket: CLIENT_BUCKET,
            Key: OUTPUT_KEY
        }).promise();

        const alerts = JSON.parse(data.Body.toString("utf-8"));

        const allowedModels = await model2.listarModelos(userId);
        const modelosPermitidos = allowedModels.map(m => m.modelo);

        const filtrado = alerts.filter(alert => {
            if (!modelosPermitidos.includes(alert.modelo)) {
                return false;
            }

            if (type === "modelo") {
                return alert.modelo === id;
            }

            if (type === "lote") {
                return alert.lote === id;
            }

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

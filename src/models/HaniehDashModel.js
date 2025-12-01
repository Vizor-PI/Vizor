const fs = require("fs");
const path = require("path");
const dadosModelosModel = require("./dadosModelosModel");

// Caminho do arquivo sincronizado do bucket
const ALERTS_FILE = path.join(__dirname, "../data/alerts.json");

function carregarAlertasDoArquivo() {
    if (!fs.existsSync(ALERTS_FILE)) return [];
    const raw = fs.readFileSync(ALERTS_FILE, "utf8");
    return JSON.parse(raw);
}

async function filtrarPorUsuario(alertas, userId) {
    // pega os modelos e lotes permitidos ao usuário
    const dadosUsuario = await dadosModelosModel.listarModelosELotes(userId);

    const modelosPermitidos = dadosUsuario.map(d => d.modelo);
    const lotesPermitidos = dadosUsuario.map(d => d.lote);

    return alertas.filter(a =>
        modelosPermitidos.includes(a.modelo) &&
        lotesPermitidos.includes(a.lote)
    );
}

module.exports = {
    async listarTodos(userId) {
        let alertas = carregarAlertasDoArquivo();
        return await filtrarPorUsuario(alertas, userId);
    },

    async filtrar(userId, filtros = {}) {
        let alertas = carregarAlertasDoArquivo();
        alertas = await filtrarPorUsuario(alertas, userId);

        const { modelo, lote, tipo, dataInicio, dataFim } = filtros;

        if (modelo) {
            alertas = alertas.filter(a => a.modelo === modelo);
        }
        if (lote) {
            alertas = alertas.filter(a => a.lote === lote);
        }
        if (tipo) {
            alertas = alertas.filter(a => a.tipo === tipo);
        }
        if (dataInicio) {
            const ini = new Date(dataInicio);
            alertas = alertas.filter(a => new Date(a.data) >= ini);
        }
        if (dataFim) {
            const fim = new Date(dataFim);
            alertas = alertas.filter(a => new Date(a.data) <= fim);
        }

        return alertas;
    },

    async getKpis(userId) {
        let alertas = await this.listarTodos(userId);

        const total = alertas.length;
        const criticos = alertas.filter(a => a.severidade === "CRITICAL").length;
        const warning = alertas.filter(a => a.severidade === "WARNING").length;

        return {
            total,
            criticos,
            warning
        };
    },

    async topModels(userId, limit = 5) {
        let alertas = await this.listarTodos(userId);

        const contador = {};

        alertas.forEach(a => {
            contador[a.modelo] = (contador[a.modelo] || 0) + 1;
        });

        return Object.entries(contador)
            .map(([modelo, count]) => ({ modelo, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    async topLotes(userId, limit = 5) {
        let alertas = await this.listarTodos(userId);

        const contador = {};

        alertas.forEach(a => {
            contador[a.lote] = (contador[a.lote] || 0) + 1;
        });

        return Object.entries(contador)
            .map(([lote, count]) => ({ lote, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    async heatmap(userId) {
        let alertas = await this.listarTodos(userId);

        const heat = {};

        alertas.forEach(a => {
            const hour = new Date(a.data).getHours();
            heat[hour] = (heat[hour] || 0) + 1;
        });

        return heat;
    }
};
 
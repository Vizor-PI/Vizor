const fs = require("fs");
const path = require("path");
const dadosModelosModel = require("./dadosModelosModel");

// Caminho do arquivo sincronizado do bucket
const ALERTS_FILE = path.join(__dirname, "../tests/alerts.json");

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
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (dataFim) {
            const fim = new Date(dataFim);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        return alertas;
    },

    async getKpis(userId, start, end) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        const totalAlerts = alertas.length;
        const criticalAlerts = alertas.filter(a => a.severidade.toLowerCase() === "critical").length;

        // Exemplo de outros KPIs (ajuste conforme necessário)
        return {
            totalAlerts,
            criticalAlerts,
            // Adicione outros KPIs conforme seu frontend espera
        };
    },

    async topModels(userId, start, end, limit = 5) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        const contador = {};

        alertas.forEach(a => {
            contador[a.modelo] = (contador[a.modelo] || 0) + 1;
        });

        return Object.entries(contador)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    async topLotes(userId, start, end, limit = 5) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        const contador = {};

        alertas.forEach(a => {
            contador[a.lote] = (contador[a.lote] || 0) + 1;
        });

        return Object.entries(contador)
            .map(([lote, count]) => ({ lote, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    async comparison(start, end, type, userId) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        // Exemplo: retorna contagem por severidade
        let result = {};
        if (type === "all") {
            result = {
                labels: ["low", "medium", "high", "critical"],
                datasets: [
                    {
                        label: "Alertas",
                        data: [
                            alertas.filter(a => a.severidade === "low").length,
                            alertas.filter(a => a.severidade === "medium").length,
                            alertas.filter(a => a.severidade === "high").length,
                            alertas.filter(a => a.severidade === "critical").length
                        ]
                    }
                ]
            };
        } else {
            // Filtro por tipo específico, se necessário
            result = {
                labels: [type],
                datasets: [
                    {
                        label: "Alertas",
                        data: [alertas.filter(a => a.severidade === type).length]
                    }
                ]
            };
        }

        return [result];
    },

    async heatmap(userId) {
        let alertas = await this.listarTodos(userId);

        // Descobre todos os dias e horas presentes nos alertas
        const diasSet = new Set();
        const horasSet = new Set();

        alertas.forEach(a => {
            const dt = new Date(a.timestamp);
            const dia = dt.toISOString().slice(0, 10); // yyyy-mm-dd
            const hora = dt.getHours();
            diasSet.add(dia);
            horasSet.add(hora);
        });

        // Ordena dias e horas
        const dias = Array.from(diasSet).sort();
        const horas = Array.from(horasSet).sort((a, b) => a - b);

        // Cria matriz [hora][dia]
        const matrix = horas.map(h =>
            dias.map(d =>
                alertas.filter(a => {
                    const dt = new Date(a.timestamp);
                    return dt.toISOString().slice(0, 10) === d && dt.getHours() === h;
                }).length
            )
        );

        // Formata horas para "08:00", "09:00", etc
        const horasFmt = horas.map(h => (h < 10 ? "0" : "") + h + ":00");

        return {
            days: dias,
            hours: horasFmt,
            matrix
        };
    },

    async list(start, end, view, state, order, userId) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => new Date(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            alertas = alertas.filter(a => new Date(a.timestamp) <= fim);
        }

        // Filtro por tipo de visualização
        let agrupados = [];
        if (view === "models" || view === "modelos") {
            agrupados = agruparPor(alertas, "modelo");
        } else if (view === "lotes") {
            agrupados = agruparPor(alertas, "lote");
        } else {
            // both
            agrupados = [
                ...agruparPor(alertas, "modelo"),
                ...agruparPor(alertas, "lote")
            ];
        }

        // Filtro por severidade/estado
        if (state && state !== "all") {
            agrupados = agrupados.filter(item => item.state === state);
        }

        // Ordenação
        if (order === "asc") {
            agrupados.sort((a, b) => a.total - b.total);
        } else {
            agrupados.sort((a, b) => b.total - a.total);
        }   

        return agrupados;

        // Função auxiliar para agrupar
        function agruparPor(alertas, campo) {
            const map = {};
            alertas.forEach(a => {
                const key = a[campo];
                if (!map[key]) {
                    map[key] = { type: campo, name: key, total: 0, critical: 0, state: "low", id: key };
                }
                map[key].total++;
                if (a.severidade === "critical") map[key].critical++;
                // Atualize o estado conforme sua lógica
                if (a.severidade === "critical") map[key].state = "critical";
                else if (a.severidade === "high" && map[key].state !== "critical") map[key].state = "high";
                else if (a.severidade === "medium" && !["critical", "high"].includes(map[key].state)) map[key].state = "medium";
            });
        return Object.values(map);
        }
    },

    async recommend(userId) {
        // Exemplo simples: recomenda o modelo/lote com mais alertas críticos, o com menos e um emergente
        let alertas = await this.listarTodos(userId);

        // Agrupa por modelo
        const modelos = {};
        alertas.forEach(a => {
            if (!modelos[a.modelo]) modelos[a.modelo] = { total: 0, critical: 0 };
            modelos[a.modelo].total++;
            if (a.severidade === "critical") modelos[a.modelo].critical++;
        });

        // Agrupa por lote
        const lotes = {};
        alertas.forEach(a => {
            if (!lotes[a.lote]) lotes[a.lote] = { total: 0, critical: 0 };
            lotes[a.lote].total++;
            if (a.severidade === "critical") lotes[a.lote].critical++;
        });

        // Recomendações simples
        const topModel = Object.entries(modelos).sort((a, b) => b[1].critical - a[1].critical)[0];
        const keepModel = Object.entries(modelos).sort((a, b) => a[1].critical - b[1].critical)[0];
        const emergingModel = Object.entries(modelos).find(([k, v]) => v.critical > 0 && v.critical < 3);

        return {
            investigate: topModel ? { type: "modelo", name: topModel[0], reason: "Mais alertas críticos" } : null,
            keep: keepModel ? { type: "modelo", name: keepModel[0], reason: "Menos alertas críticos" } : null,
            emerging: emergingModel ? { type: "modelo", name: emergingModel[0], reason: "Alertas críticos emergentes" } : null
        };
    }
};
 
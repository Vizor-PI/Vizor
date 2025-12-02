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

function parseDate(str) {
    // Try ISO first
    let d = new Date(str);
    if (!isNaN(d)) return d;
    // Try DD-MM-YYYY HH:mm:ss
    const m = str.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
    if (m) {
        return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:${m[6]}`);
    }
    return new Date(NaN);
}

function normalizeSeverity(sev) {
    if (!sev) return "";
    sev = sev.toLowerCase();
    if (sev.startsWith("crit")) return "critico";
    if (sev.startsWith("aten")) return "atencao";
    if (sev === "normal") return "normal";
    return sev;
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
            const ini = parseDate(dataInicio);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (dataFim) {
            const fim = parseDate(dataFim);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
        }

        return alertas;
    },

    async getKpis(userId) {
        let alertas = await this.listarTodos(userId);

        // Calculate last full week (Monday to Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
        // Find last Monday
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) - 7);
        lastMonday.setHours(0,0,0,0);
        // Find Monday before that
        const prevMonday = new Date(lastMonday);
        prevMonday.setDate(lastMonday.getDate() - 7);

        // Filter for last week (Monday to Sunday)
        const weekAlerts = alertas.filter(a => {
            const dt = parseDate(a.timestamp);
            return dt >= lastMonday && dt < parseDate(lastMonday.getTime() + 7*24*60*60*1000);
        });

        // Filter for previous week
        const prevWeekAlerts = alertas.filter(a => {
            const dt = parseDate(a.timestamp);
            return dt >= prevMonday && dt < lastMonday;
        });

        // KPIs
        const totalAlerts = weekAlerts.length;
        const criticoAlerts = weekAlerts.filter(a => normalizeSeverity(a.severidade) === "critico").length;

        // Model with most critico alerts
        const modelCount = {};
        weekAlerts.forEach(a => {
            if (normalizeSeverity(a.severidade) === "critico") {
                modelCount[a.modelo] = (modelCount[a.modelo] || 0) + 1;
            }
        });
        const topModel = Object.entries(modelCount).sort((a, b) => b[1] - a[1])[0];
        const topModelObj = topModel ? { name: topModel[0], count: topModel[1] } : null;

        // Lote with most critico alerts
        const loteCount = {};
        weekAlerts.forEach(a => {
            if (normalizeSeverity(a.severidade) === "critico") {
                loteCount[a.lote] = (loteCount[a.lote] || 0) + 1;
            }
        });
        const topLote = Object.entries(loteCount).sort((a, b) => b[1] - a[1])[0];
        const topLoteObj = topLote ? { name: topLote[0], count: topLote[1] } : null;

        // Model growth
        const prevModelCount = {};
        prevWeekAlerts.forEach(a => {
            if (normalizeSeverity(a.severidade) === "critico") {
                prevModelCount[a.modelo] = (prevModelCount[a.modelo] || 0) + 1;
            }
        });
        let modelGrowth = null;
        Object.keys(modelCount).forEach(model => {
            const prev = prevModelCount[model] || 0;
            const curr = modelCount[model];
            const pct = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);
            if (!modelGrowth || pct > modelGrowth.pct) {
                modelGrowth = { name: model, pct };
            }
        });

        // Lote growth
        const prevLoteCount = {};
        prevWeekAlerts.forEach(a => {
            if (normalizeSeverity(a.severidade) === "critico") {
                prevLoteCount[a.lote] = (prevLoteCount[a.lote] || 0) + 1;
            }
        });
        let loteGrowth = null;
        Object.keys(loteCount).forEach(lote => {
            const prev = prevLoteCount[lote] || 0;
            const curr = loteCount[lote];
            const pct = prev === 0 ? 100 : Math.round(((curr - prev) / prev) * 100);
            if (!loteGrowth || pct > loteGrowth.pct) {
                loteGrowth = { name: lote, pct };
            }
        });

        return {
            totalAlerts,
            criticoAlerts,
            topModel: topModelObj,
            topLote: topLoteObj,
            modelGrowth,
            loteGrowth
        };
    },

    async topModels(userId, start, end, limit = 5) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = parseDate(start);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (end) {
            const fim = parseDate(end);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
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
            const ini = parseDate(start);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (end) {
            const fim = parseDate(end);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
        }

        // Filter only critical alerts
        alertas = alertas.filter(a => normalizeSeverity(a.severidade) === "critico");

        const contador = {};
        alertas.forEach(a => {
            contador[a.lote] = (contador[a.lote] || 0) + 1;
        });

        // Return in the same structure as topModels
        return Object.entries(contador)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    async comparison(start, end, type, userId) {
        let alertas = await this.listarTodos(userId);

        if (start) {
            const ini = parseDate(start);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (end) {
            const fim = parseDate(end);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
        }

        // Exemplo: retorna contagem por severidade
        let result = {};
        if (type === "all") {
            result = {
                labels: ["normal", "atencao", "critico"],
                datasets: [
                    {
                        label: "Alertas",
                        data: [
                            alertas.filter(a => normalizeSeverity(a.severidade) === "normal").length,
                            alertas.filter(a => normalizeSeverity(a.severidade) === "atencao").length,
                            alertas.filter(a => normalizeSeverity(a.severidade) === "critico").length
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
                        data: [alertas.filter(a => normalizeSeverity(a.severidade) === type).length]
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
            const dt = parseDate(a.timestamp);
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
                    const dt = parseDate(a.timestamp);
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
            const ini = parseDate(start);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (end) {
            const fim = parseDate(end);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
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
                    map[key] = { type: campo, name: key, total: 0, critico: 0, id: key };
                }
                map[key].total++;
                if (normalizeSeverity(a.severidade) === "critico") map[key].critico++;
                if (normalizeSeverity(a.severidade) === "critico") map[key].state = "critico";
                else if (normalizeSeverity(a.severidade) === "atencao" && map[key].state !== "critico") map[key].state = "atencao";
                else if (normalizeSeverity(a.severidade) === "normal" && !["critico", "atencao"].includes(map[key].state)) map[key].state = "normal";
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
            if (!modelos[a.modelo]) modelos[a.modelo] = { total: 0, critico: 0 };
            modelos[a.modelo].total++;
            if (a.severidade === "critico") modelos[a.modelo].critico++;
        });

        // Agrupa por lote
        const lotes = {};
        alertas.forEach(a => {
            if (!lotes[a.lote]) lotes[a.lote] = { total: 0, critico: 0 };
            lotes[a.lote].total++;
            if (a.severidade === "critico") lotes[a.lote].critico++;
        });

        // Recomendações simples
        const topModel = Object.entries(modelos).sort((a, b) => b[1].critico - a[1].critico)[0];
        const keepModel = Object.entries(modelos).sort((a, b) => a[1].critico - b[1].critico)[0];
        const emergingModel = Object.entries(modelos).find(([k, v]) => v.critico > 0 && v.critico < 3);

        return {
            investigate: topModel ? { type: "modelo", name: topModel[0], reason: "Mais alertas críticos" } : null,
            keep: keepModel ? { type: "modelo", name: keepModel[0], reason: "Menos alertas críticos" } : null,
            emerging: emergingModel ? { type: "modelo", name: emergingModel[0], reason: "Alertas críticos emergentes" } : null
        };
    }
};
 
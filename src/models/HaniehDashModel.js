const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const dadosModelosModel = require("./dadosModelosModel");

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET_NAME = "vizor-client";
const PREFIX = "hanieh-client/Tech_Solutions/";

const streamToString = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });

function parseDate(str) {
    if(!str) return new Date(NaN);
    const parts = str.split(/[\s/:]/);
    // Formato DD/MM/YYYY HH:mm
    if(parts.length >= 3) {
        return new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
    }
    return new Date(str);
}

function normalizeSeverity(sev) {
    if (!sev) return "normal";
    sev = sev.toLowerCase().trim();
    if (sev.startsWith("crit") || sev === "critico") return "critico";
    if (sev.startsWith("aten") || sev === "atencao") return "atencao";
    return "normal";
}

// --- CORE: Busca e Hidrata dados do S3 ---
async function carregarTodosAlertasHidratados(userId) {
    if (!userId || userId === "undefined") return [];

    try {
        const maquinasPermitidas = await dadosModelosModel.listarModelosELotes(userId);
        if (!maquinasPermitidas || maquinasPermitidas.length === 0) return [];

        const mapaMaquinas = {};
        maquinasPermitidas.forEach(m => {
            mapaMaquinas[m.codigo] = { modelo: m.modelo, lote: m.lote };
        });

        let keys = [];
        let continuationToken;
        do {
            const listCmd = new ListObjectsV2Command({
                Bucket: BUCKET_NAME, Prefix: PREFIX, ContinuationToken: continuationToken
            });
            const res = await s3.send(listCmd);
            if (res.Contents) {
                res.Contents.forEach(obj => { if (obj.Key.endsWith(".json")) keys.push(obj.Key); });
            }
            continuationToken = res.NextContinuationToken;
        } while (continuationToken);

        const promises = keys.map(async (key) => {
            const parts = key.split('/');
            let machineId = null;
            // Procura qual parte do caminho é um código de máquina válido
            for (const part of parts) {
                if (mapaMaquinas[part]) { machineId = part; break; }
            }
            if (!machineId) return [];

            try {
                const getCmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
                const res = await s3.send(getCmd);
                const body = await streamToString(res.Body);
                const jsonArr = JSON.parse(body);
                const infoExtra = mapaMaquinas[machineId];
                
                return jsonArr.map(alerta => ({
                    ...alerta,
                    machine_id: machineId,
                    modelo: infoExtra.modelo,
                    lote: infoExtra.lote,
                    timestamp: alerta.timestamp
                }));
            } catch (err) {
                return [];
            }
        });

        const resultados = await Promise.all(promises);
        return resultados.flat();

    } catch (error) {
        console.error("Erro Model Hanieh S3:", error);
        return [];
    }
}

module.exports = {
    async listarTodos(userId) {
        return await carregarTodosAlertasHidratados(userId);
    },

    // [CORREÇÃO] Agora aceita start e end para filtrar os KPIs corretamente
    async getKpis(userId, start, end) {
        let alertas = await this.listarTodos(userId);
        
        // Filtro de Data Dinâmico (igual aos gráficos)
        if (start) {
            const ini = new Date(start);
            alertas = alertas.filter(a => parseDate(a.timestamp) >= ini);
        }
        if (end) {
            const fim = new Date(end);
            fim.setHours(23,59,59);
            alertas = alertas.filter(a => parseDate(a.timestamp) <= fim);
        }

        const totalAlerts = alertas.length;
        const criticoAlerts = alertas.filter(a => normalizeSeverity(a.severidade) === "critico").length;
        
        const modelCount = {};
        alertas.forEach(a => { if(normalizeSeverity(a.severidade)==="critico") modelCount[a.modelo] = (modelCount[a.modelo]||0)+1; });
        const topM = Object.entries(modelCount).sort((a,b)=>b[1]-a[1])[0];
        
        const loteCount = {};
        alertas.forEach(a => { if(normalizeSeverity(a.severidade)==="critico") loteCount[a.lote] = (loteCount[a.lote]||0)+1; });
        const topL = Object.entries(loteCount).sort((a,b)=>b[1]-a[1])[0];

        return {
            totalAlerts,
            criticoAlerts,
            topModel: topM ? { name: topM[0], count: topM[1] } : null,
            topLote: topL ? { name: topL[0], count: topL[1] } : null,
            modelGrowth: { name: "-", pct: 0 },
            loteGrowth: { name: "-", pct: 0 }
        };
    },

    async topModels(userId, start, end, limit = 5) {
        let alertas = await this.listarTodos(userId);
        if (start) alertas = alertas.filter(a => parseDate(a.timestamp) >= new Date(start));
        if (end) alertas = alertas.filter(a => parseDate(a.timestamp) <= new Date(end));

        const count = {};
        alertas.forEach(a => { if(normalizeSeverity(a.severidade)==="critico") count[a.modelo] = (count[a.modelo]||0)+1; });
        return Object.entries(count).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count).slice(0,limit);
    },

    async topLotes(userId, start, end, limit = 5) {
        let alertas = await this.listarTodos(userId);
        if (start) alertas = alertas.filter(a => parseDate(a.timestamp) >= new Date(start));
        if (end) alertas = alertas.filter(a => parseDate(a.timestamp) <= new Date(end));

        const count = {};
        alertas.forEach(a => { if(normalizeSeverity(a.severidade)==="critico") count[a.lote] = (count[a.lote]||0)+1; });
        return Object.entries(count).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count).slice(0,limit);
    },

    async comparison(start, end, entityType, entity, userId) {
        let alertas = await this.listarTodos(userId);
        if (start) alertas = alertas.filter(a => parseDate(a.timestamp) >= new Date(start));
        if (end) alertas = alertas.filter(a => parseDate(a.timestamp) <= new Date(end));

        if (entityType === "modelo") alertas = alertas.filter(a => a.modelo == entity);
        else if (entityType === "lote") alertas = alertas.filter(a => a.lote == entity);

        const sevs = ["normal", "atencao", "critico"];
        const data = sevs.map(s => alertas.filter(a => normalizeSeverity(a.severidade) === s).length);
        return { labels: sevs, datasets: [{ data }] };
    },

    async heatmap(start, end, userId) {
        let alertas = await this.listarTodos(userId);
        if (start) alertas = alertas.filter(a => parseDate(a.timestamp) >= new Date(start));
        if (end) alertas = alertas.filter(a => parseDate(a.timestamp) <= new Date(end));

        const diasSet = new Set();
        const horasSet = new Set();
        alertas.forEach(a => {
            const dt = parseDate(a.timestamp);
            if(!isNaN(dt)) {
                diasSet.add(dt.toISOString().slice(0, 10));
                horasSet.add(dt.getHours());
            }
        });

        const dias = Array.from(diasSet).sort();
        const horas = Array.from(horasSet).sort((a, b) => a - b);

        const matrix = horas.map(h =>
            dias.map(d =>
                alertas.filter(a => {
                    const dt = parseDate(a.timestamp);
                    return dt.toISOString().slice(0, 10) === d && dt.getHours() === h;
                }).length
            )
        );
        const horasFmt = horas.map(h => (h < 10 ? "0" : "") + h + ":00");
        return { days: dias, hours: horasFmt, matrix };
    },

    async list(start, end, view, state, order, userId) {
        let alertas = await this.listarTodos(userId);
        if (start) alertas = alertas.filter(a => parseDate(a.timestamp) >= new Date(start));
        if (end) alertas = alertas.filter(a => parseDate(a.timestamp) <= new Date(end));

        const map = {};
        alertas.forEach(a => {
            const key = view === 'lotes' ? a.lote : a.modelo;
            if(!key) return;
            if(!map[key]) map[key] = { type: view, name: key, total: 0, critico: 0, state: 'normal', id: key };
            map[key].total++;
            if(normalizeSeverity(a.severidade)==='critico') { map[key].critico++; map[key].state='critico'; }
            else if(normalizeSeverity(a.severidade)==='atencao' && map[key].state!=='critico') map[key].state='atencao';
        });
        
        let res = Object.values(map);
        if(state && state !== 'all') res = res.filter(i => i.state === state);
        if(order === 'asc') res.sort((a,b)=>a.total-b.total); else res.sort((a,b)=>b.total-a.total);
        return res;
    },

    async recommend(userId) {
        return { investigate: null, keep: null, emerging: null };
    }
};
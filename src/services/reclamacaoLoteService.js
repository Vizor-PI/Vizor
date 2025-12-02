const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const db = require("../database/config");

class DataService {

    constructor() {
        this.s3 = new S3Client({ region: "us-east-1" });
        this.bucket = "aulaso-0710-bucket-clean";
    }

    async streamToString(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });
    }

    async getS3Json(key) {
        const cmd = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key
        });

        const data = await this.s3.send(cmd);
        const text = await this.streamToString(data.Body);
        return JSON.parse(text);
    }

    async listS3Folders(prefix) {
        const cmd = new ListObjectsV2Command({
            Bucket: this.bucket,
            Prefix: prefix,
            Delimiter: "/"
        });

        const resp = await this.s3.send(cmd);
        return resp.CommonPrefixes || [];
    }

    async listarLotes(empresa) {
        const pastas = await this.listS3Folders(`${empresa}/`);
        const lotes = [];

        for (const folder of pastas) {
            const loteId = folder.Prefix.replace(`${empresa}/`, "").replace("/", "");

            try {
                const loteJson = await this.getS3Json(`${empresa}/${loteId}/lote.json`);
                lotes.push(loteJson);
            } catch (err) {
                console.warn("Erro ao carregar lote:", loteId);
            }
        }
        return lotes;
    }

    async getEmpresaIdPorNome(nomeEmpresa) {
        const sql = `SELECT id FROM empresa WHERE nome = '${nomeEmpresa}'`;
        const resultado = await db.executar(sql);
        return resultado[0]?.id || null;
    }

    async buscarLote(empresa, loteId) {

        const empresaId = await this.getEmpresaIdPorNome(empresa);

        if (!empresaId) {
            throw new Error("Empresa não encontrada no banco.");
        }

        const loteJson = await this.getS3Json(`${empresa}/${loteId}/lote.json`);

        const sql = `
        SELECT dataFabricacao 
        FROM lote 
        WHERE id = ${loteId}
        AND fkEmpresa = ${empresaId}
    `;

        const rows = await db.executar(sql);

        function formatarData(data) {
            if (!data) return null;
            const d = new Date(data);
            return d.toISOString().split("T")[0];  // fica AAAA-MM-DD
        }

        return {
            ...loteJson,
            data_fabricacao: formatarData(rows[0]?.dataFabricacao)
        };
    }

    async listarReclamacoes(empresa) {
        return this.getS3Json(`${empresa}/reclamacoes.json`);
    }

    async getDashboard(empresa) {
        return this.getS3Json(`${empresa}/dashboard.json`);
    }

}

module.exports = new DataService();
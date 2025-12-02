const { S3Client, GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const db = require("../database/config");

class DataService {

    constructor() {
        // Inicializa cliente S3
        this.s3 = new S3Client({ region: "us-east-1" });
        // [CORREÇÃO 1] Forçando o bucket certo.
        this.bucket = "vizor-client"; 
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
        console.log(`[S3] Buscando arquivo: s3://${this.bucket}/${key}`);
        try {
            const cmd = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key
            });

            const data = await this.s3.send(cmd);
            const text = await this.streamToString(data.Body);
            return JSON.parse(text);
        } catch (error) {
            console.error(`[S3] Erro ao buscar ${key}:`, error.message);
            throw error; 
        }
    }

    async listS3Folders(prefix) {
        try {
            const cmd = new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
                Delimiter: "/"
            });
            const resp = await this.s3.send(cmd);
            return resp.CommonPrefixes || [];
        } catch (error) {
            console.error(`[S3] Erro ao listar pastas em ${prefix}:`, error.message);
            return [];
        }
    }

    // [CORREÇÃO CRÍTICA]
    // A Lambda do Miguel salva usando o nome do banco ("Tech Solutions" com espaço).
    // Antes estávamos forçando underline ("Tech_Solutions"), por isso dava NoSuchKey.
    // Agora retornamos o nome original.
    formatarNomeEmpresa(nome) {
        if (!nome) return "";
        return nome; // Retorna com espaços se houver (ex: "Tech Solutions")
    }

    async listarLotes(empresa) {
        const empresaPath = this.formatarNomeEmpresa(empresa);
        const prefixo = `miguel-client/${empresaPath}/`;
        
        console.log(`[S3] Listando lotes no prefixo: ${prefixo}`);

        const pastas = await this.listS3Folders(prefixo);
        const lotes = [];

        for (const folder of pastas) {
            // folder.Prefix ex: miguel-client/Tech Solutions/1008234/
            const parts = folder.Prefix.split('/');
            // Pega o penúltimo item (o ID do lote)
            const loteId = parts[parts.length - 2]; 

            try {
                // Busca o lote.json dentro da pasta
                const key = `miguel-client/${empresaPath}/${loteId}/lote.json`;
                const loteJson = await this.getS3Json(key);
                lotes.push(loteJson);
            } catch (err) {
                console.warn(`[S3] Aviso: Lote ${loteId} não possui lote.json válido.`);
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
        if (!empresaId) throw new Error("Empresa não encontrada no banco.");

        const empresaPath = this.formatarNomeEmpresa(empresa);
        
        const loteJson = await this.getS3Json(`miguel-client/${empresaPath}/${loteId}/lote.json`);

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
            return d.toISOString().split("T")[0];
        }

        return {
            ...loteJson,
            data_fabricacao: formatarData(rows[0]?.dataFabricacao)
        };
    }

    async listarReclamacoes(empresa) {
        const empresaPath = this.formatarNomeEmpresa(empresa);
        try {
            return await this.getS3Json(`miguel-client/${empresaPath}/reclamacoes.json`);
        } catch (e) {
            console.warn("Arquivo de reclamações não encontrado, retornando vazio.");
            return { reclamacoes: [] }; 
        }
    }

    async getDashboard(empresa) {
        const empresaPath = this.formatarNomeEmpresa(empresa);
        return this.getS3Json(`miguel-client/${empresaPath}/dashboard.json`);
    }
}

module.exports = new DataService();
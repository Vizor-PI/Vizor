const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
require('dotenv').config();

// Configuração do Cliente S3
// Como esta rodando na EC2 com LabRole, não precisa de credentials.

const s3Client = new S3Client({ 
    region: "us-east-1" 
});

const BUCKET_NAME = "vizor-client";
const PREFIX = "aquino-client/";

async function listarAvisos() {
    try {
        // Listando todos os arquivos JSON na pasta dashboard-data
        const listCommand = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: PREFIX
        });

        const listResponse = await s3Client.send(listCommand);

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return [];
        }

        // Para cada arquivo encontrado, baixar e ler o JSON

        // Promise.all = baixa tudo em paralelo (rápido)
        const promises = listResponse.Contents
            .filter(item => item.Key.endsWith(".json")) // Garante que só pega JSON
            .map(async (item) => {
                const getCommand = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: item.Key
                });

                const fileResponse = await s3Client.send(getCommand);
                const str = await fileResponse.Body.transformToString();
                return JSON.parse(str);
            });

        const resultados = await Promise.all(promises);

        // Filtrar apenas os que não são "INFO" (Verdes)
        // Se quiser mostrar todos na tela de avisos, remova o filter abaixo.
        const avisosRelevantes = resultados.filter(item => 
            item.ui.severity === "ALERTA" || item.ui.severity === "CRITICO"
        );

        return avisosRelevantes;

    } catch (error) {
        console.error("Erro ao buscar avisos no S3:", error);
        throw new Error("Falha ao carregar avisos do dashboard");
    }
}

module.exports = { listarAvisos };
var database = require("../database/config");

function buscarLote(id) {

    var instrucaoSql = `
    SELECT
        lote.id AS idLote,
        lote.dataFabricacao,
        lote.qntMaquinas,
        modelo.nome AS NomeModelo,
        emp.nome AS NomeEmpresa
    FROM
        lote
    INNER JOIN
        empresa emp ON emp.id = lote.fkEmpresa
    INNER JOIN
        modelo ON modelo.id = lote.fkModelo
    INNER JOIN
        usuario us ON us.fkEmpresa = emp.id
    WHERE
        us.id = ${id}
    ORDER BY
        lote.id DESC;
    `

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarLote(idLote) {

   console.log("Executando instrução para deletar lote...");
    
    const instrucaoDeletarAlertas = `
        DELETE a FROM alertas a
        JOIN parametro p ON a.fkParametro = p.id
        JOIN miniComputador mc ON p.fkMiniComputador = mc.id
        WHERE mc.fkLote = ${idLote};
    `;
    
    const instrucaoDeletarParametros = `
        DELETE p FROM parametro p
        JOIN miniComputador mc ON p.fkMiniComputador = mc.id
        WHERE mc.fkLote = ${idLote};
    `;

    const instrucaoDeletarMiniComputadores = `
        DELETE FROM miniComputador WHERE fkLote = ${idLote};
    `;

    const instrucaoDeletarLote = `
        DELETE FROM lote WHERE id = ${idLote};
    `;
    
    return database.executar(instrucaoDeletarAlertas)
        .then(resAlertas => {
            console.log(`Deletados ${resAlertas.affectedRows} alertas.`);
            return database.executar(instrucaoDeletarParametros);
        })
        .then(resParametros => {
            console.log(`Deletados ${resParametros.affectedRows} parâmetros.`);
            return database.executar(instrucaoDeletarMiniComputadores);
        })
        .then(resMiniComputadores => {
            console.log(`Deletados ${resMiniComputadores.affectedRows} miniComputadores.`);
            return database.executar(instrucaoDeletarLote);
        })
        .then(resLote => {
            console.log(`Lote (ID ${idLote}) e todos os dependentes foram deletados com sucesso.`);
            return resLote;
        })
        .catch(erro => {
            return Promise.reject(erro);
        });
}

function cadastrar(idLote, data, qtd, modelo, codigoEmpresa) {
    console.log("ACESSEI O LOTE MODEL - Iniciando cadastro...");

    var instrucaoSql = `
        INSERT INTO lote (id, dataFabricacao, qntMaquinas, fkEmpresa, fkModelo) 
        VALUES (
            ${idLote}, 
            '${data}', 
            ${qtd}, 
            (SELECT id FROM empresa WHERE codigoAtivacao = '${codigoEmpresa}'), 
            ${modelo}
        );
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarLote,
    deletarLote,
    cadastrar
};
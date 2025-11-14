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

module.exports = {
    buscarLote
};
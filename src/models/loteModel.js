var database = require("../database/config");

function buscarLote() {

    var instrucaoSql = `
    SELECT *
    FROM lote l
    INNER JOIN maquinas m ON l.id = m.idLote
    INNER JOIN miniComputador mpc ON m.idMiniPC = mpc.id;`

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarLote
};
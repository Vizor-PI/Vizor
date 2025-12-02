var database = require("../database/config");

function listar() {
    // [CORREÇÃO] Adicionei mc.codigo na query
    var instrucao = `
        SELECT 
            mc.id,
            mc.codigo, 
            e.nome AS empresa,
            CONCAT(end.rua, ', ', end.numero, ' - ', end.bairro) AS location,
            end.latitude, 
            end.longitude
        FROM miniComputador mc
        JOIN endereco end ON mc.fkEndereco = end.id
        JOIN lote l ON mc.fkLote = l.id
        JOIN empresa e ON l.fkEmpresa = e.id
        WHERE e.nome = "Tech Solutions";       
    `;
    
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listar
};
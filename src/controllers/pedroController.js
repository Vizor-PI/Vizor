var pedroModel = require("../models/pedroModel");

function listar(req, res) {
    pedroModel.listar()
        .then(function (resultado) {
            if (resultado.length > 0) {
                
                // formatando para json
                const listaFormatada = resultado.map(row => {
                    return {
                        // formatação do nome
                        id: `DOOH-SP-P${String(row.id).padStart(3, '0')}`, 
                        
                        // junta rua, número e bairro numa string só
                        location: `${row.rua}, ${row.numero} - ${row.bairro}`,
                        
                        // garante que latitude e longitude sejam números
                        lat: parseFloat(row.latitude),
                        lng: parseFloat(row.longitude),
                        
                        empresa: row.empresa,

                        // --- DADOS DE MÉTRICA (MOCK TEMPORÁRIO) ---
                        // Aqui deixamos zerado aguardando a integração com S3 na Fase 2
                        // O status "ok" garante que o pino fique verde inicialmente
                        status: "ok", 
                        cpu: 0,
                        ram: 0,
                        disk: 0,
                        temp: 0,
                        uptime: 0,
                        ping: 0
                    };
                });

                // devolve a lista pronta para o Front-end
                res.status(200).json(listaFormatada);
            } else {
                // caso n tenha nenhuma máquina cadastrada no banco
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("\nHouve um erro ao buscar os dados: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listar
};
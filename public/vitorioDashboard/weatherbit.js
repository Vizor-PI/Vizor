async function pegarClimaAtual() {
    const resp = await fetch("https://api.weatherbit.io//v2.0/current?city=Sao%20Paulo&country=BR&key=8e71021053ed4cb0b006ce4560638438&lang=pt")
    const json = await resp.json();
    
    const clima = json.data[0];

    return {
        datetime: clima.datetime,
        temp: clima.temp,
        sensacao: clima.app_temp,
        descricao: clima.weather.description,
        icone: clima.weather.icon
    }
}


async function pegarEventosExtremos() {
    const resp = await fetch("https://api.weatherbit.io/v2.0/alerts?key=8e71021053ed4cb0b006ce4560638438&city=Sao%20Paulo&country=BR&lang=pt");
    const json = await resp.json();

    const cidade = json.city_name;
    const alertas = json.alerts; // ja vem array

    // Se não tiver alertas
    if (alertas.length === 0) {
        return {
            cidade: cidade,
            tem_alertas: false,
            mensagem: "Sem eventos climáticos extremos...",
            alertas: []
        };
    }

    // Se tiver alertas (improvavel)
    const alertasTratados = [];

    for (let i = 0; i < alertas.length; i++) {
        const a = alertas[i];

        alertasTratados.push({
            titulo: a.title,
            descricao: a.description,
            severidade: a.severity,
            inicio_local: a.effective_local,
            fim_local: a.expires_local,
            fonte: a.alerts, 
            uri: a.uri
        });
    }

    return {
        cidade: cidade,
        tem_alertas: true,
        mensagem: null,
        alertas: alertasTratados
    };
}



async function pegarPrevisaoSemanal() {
    const resp = await fetch("https://api.weatherbit.io/v2.0/forecast/daily?key=8e71021053ed4cb0b006ce4560638438&city=Sao%20Paulo&country=BR&days=7&lang=pt");
    const json = await resp.json();

    const previsoes = [];

    for (let i = 0; i < json.data.length; i++) {
        const dia = json.data[i];
        
        previsoes.push({
            datetime: dia.datetime,
            temp_max: dia.max_temp,
            temp_min: dia.min_temp,
            descricao: dia.weather.description,
            icone: dia.weather.icon
        });
    }

    return previsoes;
}

async function main() {
    const climaAtual = await pegarClimaAtual();
    const eventosExtremos = await pegarEventosExtremos();
    const previsaoSemanal = await pegarPrevisaoSemanal();

    console.log("Clima Atual:", climaAtual);
    console.log("Eventos Extremos:", eventosExtremos);
    console.log("Previsão Semanal: ", previsaoSemanal)
}

main();

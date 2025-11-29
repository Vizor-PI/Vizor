let climaAtual = null;
let eventosExtremos = null;
let previsaoSemanal = null;

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
            temp: dia.temp,
            descricao: dia.weather.description,
            icone: dia.weather.icon
        });
    }

    return previsoes;
}


function atualizarDash() {
    if (!climaAtual) return; // se a API ainda não carregou, não tenta usar
   // CLIMA ATUAL 
    document.getElementById("img_atual").src = "../assets/imgs/iconesClima/"+climaAtual.icone+".png";
    document.getElementById("temp_atual").innerHTML = climaAtual.temp + "°";
    document.getElementById("desc_atual").innerHTML = climaAtual.descricao;

    // CLIMA PREVISAO
    for(let i = 0; i < 7; i++){
        // console.log("prev_dia_"+i)
        // console.log(previsaoSemanal[i])

        let data = previsaoSemanal[i].datetime
        let [ano, mes, dia] = data.split("-") 
        document.getElementById("prev_dia_"+(i+1)).textContent = `${dia}/${mes}`

        document.getElementById("prev_img_"+(i+1)).src = "../assets/imgs/iconesClima/"+previsaoSemanal[i].icone+".png"

        document.getElementById("prev_temp_"+(i+1)).textContent = previsaoSemanal[i].temp + "°"
    }


}

async function main() {
    climaAtual = await pegarClimaAtual();
    eventosExtremos = await pegarEventosExtremos();
    previsaoSemanal = await pegarPrevisaoSemanal();

    atualizarDash()
    carregarDoohs()
}

main();

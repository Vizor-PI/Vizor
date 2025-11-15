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

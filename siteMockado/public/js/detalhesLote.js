document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const loteId = params.get("lote");
    const empresa = sessionStorage.NOME_EMPRESA;

    if (!loteId || !empresa) {
        console.error("Lote ou empresa não encontrados.");
        return;
    }

    document.getElementById("titulo-lote").innerText = `Lote ${loteId}`;

    try {
        const resp = await fetch(`/reclamacaoLote/lote/${empresa}/${loteId}`);
        const lote = await resp.json();

        preencherInformacoesGerais(lote);
        preencherResumoComponentes(lote);
        preencherComponenteCritico(lote);

        const respRecl = await fetch(`/reclamacaoLote/reclamacoes/${empresa}`);
        const reclamacoesData = await respRecl.json();

        const reclamacoesDoLote = reclamacoesData.reclamacoes.filter(r => r.lote == loteId);

        preencherTabelaReclamacoes(reclamacoesDoLote);

    } catch (err) {
        console.error("Erro ao carregar detalhes do lote:", err);
    }
});

function preencherInformacoesGerais(lote) {

    document.getElementById("info-id-lote").innerText = lote.lote;

    document.getElementById("info-data").innerText = lote.data_fabricacao
        ? lote.data_fabricacao
        : "Sem registro";

    document.getElementById("info-qtd-players").innerText = lote.total_players || 0;

    document.getElementById("info-porcent-problemas").innerText =
        `${lote.percentual_problemas || 0}%`;

    document.getElementById("info-score").innerText = lote.score || 0;

    document.getElementById("info-status").innerText = lote.status || "--";
}

function preencherResumoComponentes(lote) {
    const tbody = document.getElementById("tabela-componentes-body");
    tbody.innerHTML = "";

    const falhas = lote.falhas_por_componente || {};
    const total = lote.falhas_totais || 0;

    Object.entries(falhas).forEach(([comp, qtd]) => {
        const perc = total ? ((qtd / total) * 100).toFixed(1) : 0;

        tbody.innerHTML += `
            <tr>
                <td>${comp.toUpperCase()}</td>
                <td>${qtd}</td>
                <td>${perc}%</td>
            </tr>
        `;
    });
}


function preencherComponenteCritico(lote) {

    let falhas = lote.falhas_por_componente || {};
    let total = lote.falhas_totais || 0;

    let maiorComponente = "CPU";
    let maiorValor = 0;

    for (let comp in falhas) {
        if (falhas[comp] > maiorValor) {
            maiorValor = falhas[comp];
            maiorComponente = comp.toUpperCase();
        }
    }

    let perc = total ? ((maiorValor / total) * 100).toFixed(1) : 0;

    document.getElementById("critico-nome").innerText = maiorComponente;
    document.getElementById("critico-nome2").innerText = maiorComponente;
    document.getElementById("critico-percent").innerText = `${perc}%`;
    document.getElementById("critico-total").innerText = maiorValor;
}


function preencherTabelaReclamacoes(lista) {
    const tbody = document.getElementById("reclamacoes-body");
    const total = document.getElementById("recl-total");

    total.innerText = lista.length;

    const peso = {
        "Crítica": 3,
        "Média": 2,
        "Baixa": 1
    };

    lista.sort((a, b) => {
        if (peso[b.gravidade] !== peso[a.gravidade]) {
            return peso[b.gravidade] - peso[a.gravidade];
        }

        const parse = (d) => {
            const [dia, mes, ano] = d.split("/").map(Number);
            return new Date(ano, mes - 1, dia);
        };

        return parse(b.data) - parse(a.data);
    });

    tbody.innerHTML = "";

    lista.forEach(r => {
        let classe = r.gravidade === "Crítica" ? "gravidade-alta" :
            r.gravidade === "Média" ? "gravidade-media" :
                "gravidade-baixa";

        tbody.innerHTML += `
            <tr>
                <td>#${r.id}</td>
                <td>${r.data}</td>
                <td>${r.descricao}</td>
                <td><span class="gravidade-badge ${classe}">${r.gravidade}</span></td>
            </tr>
        `;
    });
}
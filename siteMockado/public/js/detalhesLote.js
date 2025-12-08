const BASE_DIR = "/vizor-client/miguel-client/Tech_Solutions";

document.addEventListener("DOMContentLoaded", async () => {

    const params = new URLSearchParams(window.location.search);
    const loteId = params.get("lote");

    if (!loteId) {
        console.error("Nenhum lote recebido via URL.");
        return;
    }

    document.getElementById("titulo-lote").innerText = `Detalhes do LOTE ${loteId}`;

    try {
        const respLote = await fetch(`${BASE_DIR}/${loteId}/lote.json`);
        const lote = await respLote.json();

        preencherInformacoesGerais(lote);
        preencherResumoComponentes(lote);
        preencherComponenteCritico(lote);

        const respRecl = await fetch(`${BASE_DIR}/reclamacoes.json`);
        const dadosRecl = await respRecl.json();

        const reclamacoesDoLote = dadosRecl.reclamacoes.filter(r => r.lote == loteId);

        preencherTabelaReclamacoes(reclamacoesDoLote);

    } catch (err) {
        console.error("Erro ao carregar detalhes:", err);
    }
});

function preencherInformacoesGerais(lote) {
    document.getElementById("info-id-lote").innerText = lote.lote;
    document.getElementById("info-data").innerText = lote.data_fabricacao || "Sem registro";
    document.getElementById("info-qtd-players").innerText = lote.total_players || 0;
    document.getElementById("info-porcent-problemas").innerText = `${lote.percentual_problemas || 0}%`;
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
    const falhas = lote.falhas_por_componente || {};
    const total = lote.falhas_totais || 0;

    const [comp, qtd] = Object.entries(falhas).sort((a, b) => b[1] - a[1])[0] || ["CPU", 0];
    const perc = total ? ((qtd / total) * 100).toFixed(1) : 0;

    document.getElementById("critico-nome").innerText = comp.toUpperCase();
    document.getElementById("critico-nome2").innerText = comp.toUpperCase();
    document.getElementById("critico-percent").innerText = `${perc}%`;
    document.getElementById("critico-total").innerText = qtd;
}

function preencherTabelaReclamacoes(lista) {
    const tbody = document.getElementById("reclamacoes-body");
    const total = document.getElementById("recl-total");

    total.innerText = lista.length;

    const peso = { "Crítica": 3, "Média": 2, "Baixa": 1 };

    lista.sort((a, b) => peso[b.gravidade] - peso[a.gravidade]);

    tbody.innerHTML = "";

    lista.forEach(r => {
        let classe =
            r.gravidade === "Crítica" ? "gravidade-alta" :
            r.gravidade === "Média" ? "gravidade-media" :
            "gravidade-baixa";

        tbody.innerHTML += `
            <tr onclick="window.location='detalhesReclamacao.html?reclamacao=${r.id}&lote=${r.lote}'">
                <td>#${r.id}</td>
                <td>${r.data}</td>
                <td>${r.descricao}</td>
                <td><span class="gravidade-badge ${classe}">${r.gravidade}</span></td>
            </tr>
        `;
    });
}

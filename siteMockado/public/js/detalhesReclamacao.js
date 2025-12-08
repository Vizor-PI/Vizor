const BASE_DIR = "/vizor-client/miguel-client/Tech_Solutions";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idRec = params.get("reclamacao");
    const loteId = params.get("lote");
    if (!idRec) {
        console.error("Nenhum ID de reclamação recebido na URL");
        return;
    }

    try {
        const resp = await fetch(`${BASE_DIR}/reclamacoes.json`);
        const data = await resp.json();

        const rec = data.reclamacoes.find(r => r.id == idRec);

        if (!rec) {
            console.error("Reclamação não encontrada.");
            return;
        }

        document.getElementById("titulo-reclamacao").innerText =
            `Detalhes da Reclamação #${idRec} — Lote ${rec.lote}`;

        preencherInfo(rec);

        const reclamacoesMesmoLote = data.reclamacoes.filter(
            r => r.lote == rec.lote && r.id != rec.id
        );

        document.getElementById("nome-lote-titulo").innerText = rec.lote;
        document.getElementById("recl-lote-total").innerText = reclamacoesMesmoLote.length;

        montarListaLote(reclamacoesMesmoLote);

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
    }
});


function preencherInfo(rec) {
    document.getElementById("rec-player").innerText = rec.player_id;
    document.getElementById("rec-lote").innerText = rec.lote;
    document.getElementById("rec-data").innerText = rec.data;
    document.getElementById("rec-descricao").innerText = rec.descricao;

    const badge = document.getElementById("rec-gravidade");
    badge.innerText = rec.gravidade;

    badge.className = "gravidade-badge " + (
        rec.gravidade === "Crítica" ? "gravidade-alta" :
            rec.gravidade === "Média" ? "gravidade-media" :
                "gravidade-baixa"
    );
}


function montarListaLote(lista) {
    const div = document.getElementById("reclamacoes-lote-lista");

    const peso = { "Crítica": 3, "Média": 2, "Baixa": 1 };
    lista.sort((a, b) => peso[b.gravidade] - peso[a.gravidade]);

    div.innerHTML = "";

    lista.forEach(r => {
        let classe =
            r.gravidade === "Crítica" ? "gravidade-alta" :
                r.gravidade === "Média" ? "gravidade-media" :
                    "gravidade-baixa";

        div.innerHTML += `
            <div class="reclam-item" onclick="window.location='detalhesReclamacao.html?reclamacao=${r.id}&lote=${r.lote}'">
                <span class="badge gravidade-badge badge-na-lista ${classe}">
                    ${r.gravidade}
                </span>
                <strong>#${r.id} — ${r.player_id}</strong>
                <p class="desc">${r.descricao}</p>
                <p class="data">📅 ${r.data}</p>
            </div>
        `;
    });
}

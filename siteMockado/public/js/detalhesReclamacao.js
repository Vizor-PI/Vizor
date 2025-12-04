document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const idRec = params.get("reclamacao");
    const empresa = sessionStorage.NOME_EMPRESA;

    if (!idRec || !empresa) {
        console.error("Erro: ID ou empresa não encontrados.");
        return;
    }

    const resp = await fetch(`/reclamacaoLote/reclamacoes/${empresa}`);
    const data = await resp.json();

    const rec = data.reclamacoes.find(r => r.id == idRec);
    if (!rec) {
        console.error("Reclamação não encontrada.");
        return;
    }

    document.getElementById("titulo-reclamacao").innerText =
        `Detalhes da Reclamação #${idRec} — Lote ${rec.lote}`;

    document.getElementById("rec-player").innerText = rec.player_id;
    document.getElementById("rec-lote").innerText = rec.lote;
    document.getElementById("rec-data").innerText = rec.data;
    document.getElementById("rec-descricao").innerText = rec.descricao;

    const badge = document.getElementById("rec-gravidade");
    badge.innerText = rec.gravidade;

    if (rec.gravidade === "Crítica") badge.classList.add("gravidade-alta");
    else if (rec.gravidade === "Média") badge.classList.add("gravidade-media");
    else badge.classList.add("gravidade-baixa");

    const reclamacoesMesmoLote = data.reclamacoes.filter(r => r.lote == rec.lote && r.id != rec.id);

    document.getElementById("nome-lote-titulo").innerText = rec.lote;
    document.getElementById("recl-lote-total").innerText = reclamacoesMesmoLote.length;

    const lista = document.getElementById("reclamacoes-lote-lista");
    lista.innerHTML = "";

    const peso = {
        "Crítica": 3,
        "Média": 2,
        "Baixa": 1
    };

    reclamacoesMesmoLote.sort((a, b) => {
        if (peso[b.gravidade] !== peso[a.gravidade]) {
            return peso[b.gravidade] - peso[a.gravidade];
        }

        const parse = (d) => {
            const [dia, mes, ano] = d.split("/").map(Number);
            return new Date(ano, mes - 1, dia);
        };

        return parse(b.data) - parse(a.data);
    });

    reclamacoesMesmoLote.forEach(r => {
        let gravidadeClass =
            r.gravidade === "Crítica" ? "gravidade-alta" :
                r.gravidade === "Média" ? "gravidade-media" :
                    "gravidade-baixa";

        const item = `
            <div class="reclam-item" onclick="window.location.href='detalhesReclamacao.html?reclamacao=${r.id}'">
                <span class="badge gravidade-badge badge-na-lista ${gravidadeClass}">
                    ${r.gravidade}
                </span>

                <strong>#${r.id}  ${r.player_id}</strong>

                <p class="desc">${r.descricao}</p>

                <p class="data">📅 ${r.data}</p>
            </div>
        `;
        lista.innerHTML += item;
    });
});
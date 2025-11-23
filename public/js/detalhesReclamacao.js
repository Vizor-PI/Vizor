document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("reclamacao");

    // Coloca no título
    document.getElementById("titulo-reclamacao").innerText = `Detalhes da Reclamação #${id}`;

    // EXEMPLO – depois trocamos pelo fetch real
    const reclamacao = {
        id: id,
        player: "PLY-2024-001234",
        lote: "LOTE-2024-A1",
        data: "15/11/2025",
        descricao: "Superaquecimento frequente da CPU",
        gravidade: "Alta"
    };

    document.getElementById("rec-player").innerText = reclamacao.player;
    document.getElementById("rec-lote").innerText = reclamacao.lote;
    document.getElementById("rec-data").innerText = reclamacao.data;
    document.getElementById("rec-descricao").innerText = reclamacao.descricao;

    const gravidade = document.getElementById("rec-gravidade");
    gravidade.innerText = reclamacao.gravidade;

    if (reclamacao.gravidade === "Alta") gravidade.classList.add("gravidade-alta");
    else if (reclamacao.gravidade === "Média") gravidade.classList.add("gravidade-media");
    else gravidade.classList.add("gravidade-baixa");

});

document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const idRec = params.get("reclamacao");

    const reclamacaoAtual = {
        id: idRec,
        player: "PLY-2024-001234",
        lote: "LOTE-2024-A1",
        data: "15/11/2025",
        descricao: "Superaquecimento frequente da CPU",
        gravidade: "Alta"
    };

    document.getElementById("titulo-reclamacao").innerText = `Detalhes da Reclamação #${idRec}`;
    document.getElementById("rec-player").innerText = reclamacaoAtual.player;
    document.getElementById("rec-lote").innerText = reclamacaoAtual.lote;
    document.getElementById("rec-data").innerText = reclamacaoAtual.data;
    document.getElementById("rec-descricao").innerText = reclamacaoAtual.descricao;

    const badge = document.getElementById("rec-gravidade");
    badge.innerText = reclamacaoAtual.gravidade;

    if (reclamacaoAtual.gravidade === "Alta") badge.classList.add("gravidade-alta");
    else if (reclamacaoAtual.gravidade === "Média") badge.classList.add("gravidade-media");
    else badge.classList.add("gravidade-baixa");

    const reclamacoesMesmoLote = [
        { id: 6, player: "PLY-2024-001567", descricao: "RAM com falhas intermitentes", data: "16/11/2025", gravidade: "Alta" },
        { id: 7, player: "PLY-2024-001890", descricao: "HD apresentando lentidão", data: "17/11/2025", gravidade: "Média" },
        { id: 11, player: "PLY-2024-001999", descricao: "Superaquecimento frequente da CPU", data: "18/11/2025", gravidade: "Alta" }
    ];

    document.getElementById("nome-lote-titulo").innerText = reclamacaoAtual.lote;


    document.getElementById("recl-lote-total").innerText = reclamacoesMesmoLote.length;

    const lista = document.getElementById("reclamacoes-lote-lista");

    lista.innerHTML = "";

    reclamacoesMesmoLote.forEach(r => {

        let gravidadeClass =
            r.gravidade === "Alta" ? "gravidade-alta" :
            r.gravidade === "Média" ? "gravidade-media" :
            "gravidade-baixa";

        const item = `
            <div class="reclam-item" onclick="window.location.href='detalhesReclamacao.html?reclamacao=${r.id}'">
                
                <span class="badge gravidade-badge badge-na-lista ${gravidadeClass}">
                    ${r.gravidade}
                </span>

                <strong>#${r.id}  ${r.player}</strong>

                <p class="desc">${r.descricao}</p>

                <p class="data">📅 ${r.data}</p>
            </div>
        `;

        lista.innerHTML += item;
    });

});
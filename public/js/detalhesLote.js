document.addEventListener("DOMContentLoaded", () => {

    const reclamacoesExemplo = [
        { id: 1, data: "15/11/2025", descricao: "Superaquecimento frequente da CPU", gravidade: "Alta" },
        { id: 6, data: "16/11/2025", descricao: "RAM com falhas intermitentes", gravidade: "Alta" },
        { id: 7, data: "17/11/2025", descricao: "HD apresentando lentidão", gravidade: "Média" }
    ];

    function preencherTabelaReclamacoes(lista) {
        const body = document.getElementById("reclamacoes-body");
        const total = document.getElementById("recl-total");

        total.textContent = lista.length;
        body.innerHTML = "";

        lista.forEach(r => {
            let gravidadeClass =
                r.gravidade === "Alta" ? "gravidade-alta" :
                r.gravidade === "Média" ? "gravidade-media" :
                "gravidade-baixa";

            body.innerHTML += `
                <tr>
                    <td>#${r.id}</td>
                    <td>📅 ${r.data}</td>
                    <td>${r.descricao}</td>
                    <td><span class="gravidade-badge ${gravidadeClass}">${r.gravidade}</span></td>
                </tr>
            `;
        });
    }

    preencherTabelaReclamacoes(reclamacoesExemplo);

});
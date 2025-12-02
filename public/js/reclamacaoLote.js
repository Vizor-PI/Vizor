document.addEventListener("DOMContentLoaded", () => {
  (async function initKPIs() {
    try {
      const empresa = sessionStorage.NOME_EMPRESA;

      if (!empresa) {
        console.error("Empresa não encontrada no sessionStorage.");
        return;
      }


      const kpiElems = {
        lotes_problematicos: document.getElementById("kpi-lote-problematico"),
        lotes_saudaveis: document.getElementById("kpi-lote-saudavel"),
        reclamacoes_criticas: document.getElementById("kpi-reclamacoes-criticas"),
        mediana_score_lotes: document.getElementById("kpi-mediana-score")
      };

      Object.values(kpiElems).forEach(el => {
        if (el) el.innerText = "—";
      });

      const resp = await fetch(`/reclamacaoLote/dashboard/${encodeURIComponent(empresa)}`);
      if (!resp.ok) throw new Error(`Erro ${resp.status} ao buscar dashboard`);

      const dados = await resp.json();

      if (kpiElems.lotes_problematicos && dados.lotes_problematicos != null) {
        kpiElems.lotes_problematicos.innerText = dados.lotes_problematicos;
      }

      if (kpiElems.lotes_saudaveis && dados.lotes_saudaveis != null) {
        const val = String(dados.lotes_saudaveis);
        kpiElems.lotes_saudaveis.innerText = `${val}%`;
      }

      if (kpiElems.reclamacoes_criticas && dados.reclamacoes_criticas != null) {
        kpiElems.reclamacoes_criticas.innerText = dados.reclamacoes_criticas;
      }

      if (kpiElems.mediana_score_lotes && dados.mediana_score_lotes != null) {
        kpiElems.mediana_score_lotes.innerText = dados.mediana_score_lotes;
      }

    } catch (err) {
      console.error("Erro ao carregar KPIs:", err);
      const safeEls = [
        "kpi-lote-problematico",
        "kpi-lote-saudavel",
        "kpi-reclamacoes-criticas",
        "kpi-mediana-score"
      ];
      safeEls.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "-";
      });
    }

    criarGrafico();
    carregarLotesParaGrafico(sessionStorage.NOME_EMPRESA);
    carregarRankingLote(sessionStorage.NOME_EMPRESA);
    carregarRankingReclamacoes(sessionStorage.NOME_EMPRESA);

  }

  )();
});

async function carregarRankingLote(empresa) {
  try {
    const resp = await fetch(`/reclamacaoLote/lotes/${encodeURIComponent(empresa)}`);
    if (!resp.ok) throw new Error("Erro ao buscar lotes");

    const lotes = await resp.json();

    const ranking = lotes
      .sort((a, b) => {
        if (b.falhas_totais !== a.falhas_totais)
          return b.falhas_totais - a.falhas_totais;

        return a.score - b.score;
      })


    const tbody = document.getElementById("tabela-ranking-lote");

    tbody.innerHTML = "";

    ranking.forEach((lote, i) => {

      let badgeClass = "";
      switch (lote.status) {
        case "Crítico": badgeClass = "badge--crit"; break;
        case "Alerta": badgeClass = "badge--warn"; break;
        default: badgeClass = "badge--ok";
      }

      tbody.innerHTML += `
        <tr class="linha-lote" data-lote="${lote.lote}">
            <td>#${i + 1}</td>
            <td>${lote.lote}</td>
            <td>${lote.falhas_totais}</td>
            <td><span class="badge ${badgeClass}">${lote.score}</span></td>
            <td><span class="badge ${badgeClass}">${lote.status}</span></td>
            <td>➜</td>
        </tr>
      `;
    });

    document.querySelectorAll(".linha-lote").forEach(tr => {
      tr.addEventListener("click", () => {
        const id = tr.getAttribute("data-lote");
        window.location = `detalhesLote.html?lote=${id}`;
      });
    });

  } catch (err) {
    console.error("Erro carregando ranking:", err);
  }
}

async function carregarRankingReclamacoes(empresa) {
  try {
    const resp = await fetch(`/reclamacaoLote/reclamacoes/${encodeURIComponent(empresa)}`);
    if (!resp.ok) throw new Error("Erro ao buscar reclamações");

    const data = await resp.json();

    let lista = data.reclamacoes;

    const peso = { "Crítica": 3, "Média": 2, "Baixa": 1 };

    const ranking = lista.sort((a, b) => {
      if (peso[b.gravidade] !== peso[a.gravidade]) {
        return peso[b.gravidade] - peso[a.gravidade];
      }

      const parse = (d) => {
        const [dia, mes, ano] = d.split("/").map(Number);
        return new Date(ano, mes - 1, dia);
      };

      return parse(b.data) - parse(a.data);
    });

    const tbody = document.getElementById("tabela-ranking-reclamacoes");
    tbody.innerHTML = "";

    ranking.forEach((rec, i) => {
      tbody.innerHTML += `
                <tr class="linha-reclamacao" data-id="${rec.id}">
                    <td>#${i + 1}</td>
                    <td>${rec.lote}</td>
                    <td>${rec.data}</td>
                    <td>${rec.descricao}</td>
                    <td>➜</td>
                </tr>
            `;
    });

    document.querySelectorAll(".linha-reclamacao").forEach(tr => {
      tr.onclick = () => {
        const id = tr.getAttribute("data-id");
        window.location.href = `detalhesReclamacao.html?reclamacao=${id}`;
      };
    });

  } catch (err) {
    console.error("Erro ao carregar ranking de reclamações:", err);
  }
}

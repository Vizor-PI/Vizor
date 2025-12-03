const reclamacaoLoteService = require("../services/reclamacaoLoteService");

async function listarLotes(req, res) {
    try {
        const empresa = req.params.empresa;
        const dados = await reclamacaoLoteService.listarLotes(empresa);
        res.json(dados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao listar lotes" });
    }
}

async function buscarLote(req, res) {
    try {
        const { empresa, loteId } = req.params;
        const dados = await reclamacaoLoteService.buscarLote(empresa, loteId);
        res.json(dados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar lote" });
    }
}

async function listarReclamacoes(req, res) {
    try {
        const empresa = req.params.empresa;
        const dados = await reclamacaoLoteService.listarReclamacoes(empresa);
        res.json(dados);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar reclamações" });
    }
}

    async function dashboard(req, res) {
    try {
        const empresa = req.params.empresa;

        const dashboard = await reclamacaoLoteService.getDashboard(empresa);

        const dadosReclamacoes = await reclamacaoLoteService.listarReclamacoes(empresa);

        const totalCriticas = dadosReclamacoes.reclamacoes.filter(
            r => r.gravidade?.toLowerCase() === "crítica".toLowerCase()
        ).length;

        dashboard.reclamacoes_criticas = totalCriticas;

        res.json(dashboard);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar dashboard" });
    }
}

module.exports = {
    listarLotes,
    buscarLote,
    listarReclamacoes,
    dashboard,
};
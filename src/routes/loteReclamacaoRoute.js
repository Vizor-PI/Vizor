const express = require("express");
const router = express.Router();
const reclamacaoLoteController = require("../controllers/reclamacaoLoteController");

router.get("/lotes/:empresa", reclamacaoLoteController.listarLotes);
router.get("/lote/:empresa/:loteId", reclamacaoLoteController.buscarLote);
router.get("/reclamacoes/:empresa", reclamacaoLoteController.listarReclamacoes);
router.get("/dashboard/:empresa", reclamacaoLoteController.dashboard);

module.exports = router;
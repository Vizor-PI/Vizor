var express = require("express");
var router = express.Router();

var loteController = require("../controllers/loteController");

router.post("/buscar", function (req, res) {
    loteController.buscarLote(req, res);
});

router.delete("/deletarLote/:idLote", function (req, res) {
    loteController.deletarLote(req, res);
})

module.exports = router;
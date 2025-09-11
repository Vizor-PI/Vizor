var express = require("express");
var router = express.Router();

var loteController = require("../controllers/loteController");

router.get("/buscar", function (req, res) {
    loteController.buscarLote(req, res);
});

module.exports = router;
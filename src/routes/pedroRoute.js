var express = require("express");
var router = express.Router();

var pedroController = require("../controllers/pedroController");

router.get("/listar", function (req, res) {
    pedroController.listar(req, res);
});

module.exports = router;
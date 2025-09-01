var express = require("express");
var router = express.Router();

var dadosUsuarioController = require("../controllers/dadosUsuarioController.js");

router.get("/listar/:id", function (req, res) {
    dadosUsuarioController.listarDados(req, res);
});

router.get("/listar", function (req,res){
    dadosUsuarioController.listarUsuarios(req,res);
});



module.exports = router;
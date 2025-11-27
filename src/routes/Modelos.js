var express = require("express");
var router = express.Router();

var modeloController = require("../controllers/modeloController");

//Recebendo os dados do html e direcionando para a função cadastrar de modeloController.js
router.post("/cadastrar", function (req, res) {
    modeloController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    modeloController.autenticar(req, res);
});

router.put("/atualizar", function (req, res) {
    modeloController.atualizar(req, res);
});

router.put("/atualizarmodelo/:id", function(req,res){
    modeloController.atualizarmodelo(req,res);
});

router.delete("/deletarModelo/:id", function(req,res){
    modeloController.deletarModelo(req,res);
})

module.exports = router;
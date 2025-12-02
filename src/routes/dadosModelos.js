var express = require("express");
var router = express.Router();

var dadosModeloController = require("../controllers/dadosModeloController.js");

router.get("/listar/:id", function (req, res) {
    dadosModeloController.listarDados(req, res);
});

router.post("/listar", function (req,res){
    dadosModeloController.listarModelos(req,res);
});

router.get("/listarTodos", function (req,res){
    dadosModeloController.listarTodosModelos(req,res);
});

router.get("/listarModelosELotes/:id",function(req,res){
    dadosModeloController.listarModelosELotes(req,res);
});

module.exports = router;
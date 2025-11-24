var express = require("express");
var router = express.Router();

var HaniController = require("../controllers/HaniehDashController");

router.get("/getKpis", function (req, res) {
    HaniController.getKpis(req, res);
});

router.get("/topModels", function (req, res) {
    HaniController.topModels(req, res);
});

router.get("/topLotes", function (req, res) {
    HaniController.topLotes(req, res);
});

router.get("/comparison", function (req, res) {
    HaniController.comparison(req, res);
});

router.get("/heatmap", function (req, res) {
    HaniController.heatmap(req, res);
});

router.get("/list", function (req, res) {
    HaniController.list(req, res);
});

router.get("/recommend", function (req, res) {
    HaniController.recommend(req, res);
});

router.get("/listAlerts", function (req, res) {
    HaniController.listAlerts(req, res);
});

module.exports = router;

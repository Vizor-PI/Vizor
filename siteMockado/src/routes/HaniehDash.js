var express = require("express");
var router = express.Router();
var HaniController = require("../controllers/HaniehDashController");

router.post("/syncAlerts", (req, res) => HaniController.syncAlerts(req, res));
router.get("/getKpis", (req, res) => HaniController.getKpis(req, res));
router.get("/topModels", (req, res) => HaniController.topModels(req, res));
router.get("/topLotes", (req, res) => HaniController.topLotes(req, res));
router.get("/comparison", (req, res) => HaniController.comparison(req, res));
router.get("/heatmap", (req, res) => HaniController.heatmap(req, res));
router.get("/list", (req, res) => HaniController.list(req, res));
router.get("/recommend", (req, res) => HaniController.recommend(req, res));
router.get("/alerts/:type/:id", (req, res) => HaniController.listAlerts(req, res));

module.exports = router;
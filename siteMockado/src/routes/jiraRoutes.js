    const express = require('express');
    const router = express.Router();
    const jiraController = require('../controllers/jiraController');

    router.get('/issues', jiraController.listarChamados);
    router.get('/metricas', jiraController.metricas);
    router.get('/avisos', jiraController.listarAvisos);

    module.exports = router;

    const express = require('express');
    const router = express.Router();
    const jiraController = require('../controllers/jiraController');

    router.get('/issues', jiraController.listarChamados);
    router.get('/metricas', jiraController.metricas);

    module.exports = router;

const express = require('express');
const router = express.Router();
const documentationController = require('../controllers/documentationController');

// Documentation routes
router.get('/documentation', documentationController.getAllDocumentation);
router.get('/documentation/:type', documentationController.getDocumentationByType);
router.post('/documentation/seed', documentationController.seedDocumentation);

module.exports = router;

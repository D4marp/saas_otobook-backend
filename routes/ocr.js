/**
 * OCR Routes - API endpoints for OCR service
 */

const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocrController');

// Provider routes
router.get('/ocr/providers', ocrController.getProviders);
router.get('/ocr/providers/:providerId', ocrController.getProvider);
router.get('/ocr/providers/compare', ocrController.compareProviders);

// Processing routes
router.post('/ocr/process', ocrController.processImage);
router.post('/ocr/demo', ocrController.demoOCR);
router.post('/ocr/batch', ocrController.batchProcess);
router.post('/ocr/extract', ocrController.extractStructuredData);

// Configuration routes
router.get('/ocr/platform/:platform', ocrController.getPlatformConfig);
router.get('/ocr/docker-config', ocrController.getDockerConfig);

module.exports = router;

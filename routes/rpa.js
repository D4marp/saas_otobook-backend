/**
 * RPA Routes - API endpoints for RPA service
 */

const express = require('express');
const router = express.Router();
const rpaController = require('../controllers/rpaController');

// Action and platform info routes
router.get('/rpa/actions', rpaController.getActionTypes);
router.get('/rpa/platforms', rpaController.getPlatforms);
router.get('/rpa/platforms/:platformId', rpaController.getPlatformConfig);

// Template routes
router.get('/rpa/templates', rpaController.getTemplates);
router.get('/rpa/templates/:templateId', rpaController.getTemplate);

// Workflow CRUD routes
router.post('/rpa/workflows', rpaController.createWorkflow);
router.get('/rpa/workflows', rpaController.getWorkflows);
router.get('/rpa/workflows/:workflowId', rpaController.getWorkflow);
router.put('/rpa/workflows/:workflowId', rpaController.updateWorkflow);
router.delete('/rpa/workflows/:workflowId', rpaController.deleteWorkflow);

// Workflow execution routes
router.post('/rpa/workflows/:workflowId/execute', rpaController.executeWorkflow);
router.post('/rpa/demo', rpaController.demoExecute);

// Connection and history routes
router.post('/rpa/test-connection', rpaController.testConnection);
router.get('/rpa/history', rpaController.getRunHistory);

// Configuration routes
router.get('/rpa/docker-config', rpaController.getDockerConfig);
router.get('/rpa/schedule-config', rpaController.getScheduleConfig);

module.exports = router;

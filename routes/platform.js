/**
 * Platform Routes - API endpoints for platform integration and deployment
 */

const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');

// Deployment platforms info
router.get('/platform/deployments/platforms', platformController.getDeploymentPlatforms);
router.get('/platform/integrations', platformController.getIntegrations);

// Connection management
router.post('/platform/connections', platformController.createConnection);
router.get('/platform/connections', platformController.getConnections);
router.get('/platform/connections/:connectionId', platformController.getConnection);
router.post('/platform/connections/:connectionId/test', platformController.testConnection);
router.delete('/platform/connections/:connectionId', platformController.deleteConnection);

// Deployment management
router.post('/platform/deployments', platformController.createDeployment);
router.get('/platform/deployments', platformController.getDeployments);
router.get('/platform/deployments/:deploymentId', platformController.getDeployment);
router.post('/platform/deployments/:deploymentId/deploy', platformController.deploy);

// Configuration generation
router.post('/platform/generate/docker-compose', platformController.generateDockerCompose);
router.post('/platform/generate/kubernetes', platformController.generateKubernetesManifests);
router.get('/platform/paas-config', platformController.getPaaSConfig);

// Demo
router.post('/platform/demo-deploy', platformController.demoDeployment);

module.exports = router;

/**
 * Platform Controller - Handles platform integration and deployment
 */

const platformService = require('../services/platformService');

const platformController = {
  // Get all deployment platforms
  getDeploymentPlatforms: async (req, res) => {
    try {
      const platforms = platformService.getDeploymentPlatforms();
      res.json({
        success: true,
        data: platforms
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all available integrations
  getIntegrations: async (req, res) => {
    try {
      const { category } = req.query;
      const integrations = platformService.getIntegrations(category);
      res.json({
        success: true,
        data: integrations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create a new platform connection
  createConnection: async (req, res) => {
    try {
      const { platform, name, category, credentials, config } = req.body;
      
      if (!platform || !name) {
        return res.status(400).json({
          success: false,
          error: 'Platform and name are required'
        });
      }

      const connection = platformService.createConnection({
        platform,
        name,
        category,
        credentials,
        config
      });

      res.status(201).json({
        success: true,
        data: connection
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all connections
  getConnections: async (req, res) => {
    try {
      const { category } = req.query;
      const connections = platformService.getConnections(category);
      res.json({
        success: true,
        data: connections
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get specific connection
  getConnection: async (req, res) => {
    try {
      const { connectionId } = req.params;
      const connection = platformService.getConnection(connectionId);
      res.json({
        success: true,
        data: connection
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Test connection health
  testConnection: async (req, res) => {
    try {
      const { connectionId } = req.params;
      const result = await platformService.testConnection(connectionId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete connection
  deleteConnection: async (req, res) => {
    try {
      const { connectionId } = req.params;
      const result = platformService.deleteConnection(connectionId);
      res.json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create deployment configuration
  createDeployment: async (req, res) => {
    try {
      const { name, platform, services, config } = req.body;
      
      if (!name || !platform) {
        return res.status(400).json({
          success: false,
          error: 'Name and platform are required'
        });
      }

      const deployment = platformService.createDeployment({
        name,
        platform,
        services,
        config
      });

      res.status(201).json({
        success: true,
        data: deployment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all deployments
  getDeployments: async (req, res) => {
    try {
      const deployments = platformService.getDeployments();
      res.json({
        success: true,
        data: deployments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get specific deployment
  getDeployment: async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const deployment = platformService.getDeployment(deploymentId);
      res.json({
        success: true,
        data: deployment
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Deploy instance
  deploy: async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const result = await platformService.deploy(deploymentId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Generate Docker Compose configuration
  generateDockerCompose: async (req, res) => {
    try {
      const { services } = req.body;
      const config = platformService.generateDockerCompose(services);
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Generate Kubernetes manifests
  generateKubernetesManifests: async (req, res) => {
    try {
      const { services } = req.body;
      const manifests = platformService.generateKubernetesManifests(services);
      res.json({
        success: true,
        data: manifests
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get PaaS configuration
  getPaaSConfig: async (req, res) => {
    try {
      const { provider } = req.query;
      const config = platformService.getPaaSConfig(provider);
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Demo deployment
  demoDeployment: async (req, res) => {
    try {
      const { services = ['ocr', 'rpa'] } = req.body;

      // Create demo deployment
      const deployment = platformService.createDeployment({
        name: 'demo-otobook',
        platform: 'docker',
        services: services,
        isDemo: true
      });

      // Simulate deployment
      const result = await platformService.deploy(deployment.id);

      res.json({
        success: true,
        data: {
          ...result,
          isDemo: true,
          note: 'This is a demo deployment with simulated results.',
          dockerCompose: platformService.generateDockerCompose(services)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = platformController;

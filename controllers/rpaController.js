/**
 * RPA Controller - Handles RPA API requests
 */

const rpaService = require('../services/rpaService');

const rpaController = {
  // Get all action types
  getActionTypes: async (req, res) => {
    try {
      const actionTypes = rpaService.getActionTypes();
      res.json({
        success: true,
        data: actionTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all platforms
  getPlatforms: async (req, res) => {
    try {
      const platforms = rpaService.getPlatforms();
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

  // Get specific platform config
  getPlatformConfig: async (req, res) => {
    try {
      const { platformId } = req.params;
      const config = rpaService.getPlatformConfig(platformId);
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all workflow templates
  getTemplates: async (req, res) => {
    try {
      const templates = rpaService.getTemplates();
      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get specific template
  getTemplate: async (req, res) => {
    try {
      const { templateId } = req.params;
      const template = rpaService.getTemplate(templateId);
      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create a new workflow
  createWorkflow: async (req, res) => {
    try {
      const { name, description, steps, schedule, platformConnections } = req.body;
      
      if (!name || !steps || !Array.isArray(steps)) {
        return res.status(400).json({
          success: false,
          error: 'Name and steps array are required'
        });
      }

      const workflow = rpaService.createWorkflow({
        name,
        description,
        steps,
        schedule,
        platformConnections
      });

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all workflows
  getWorkflows: async (req, res) => {
    try {
      const workflows = rpaService.getWorkflows();
      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get specific workflow
  getWorkflow: async (req, res) => {
    try {
      const { workflowId } = req.params;
      const workflow = rpaService.getWorkflow(workflowId);
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update workflow
  updateWorkflow: async (req, res) => {
    try {
      const { workflowId } = req.params;
      const updates = req.body;
      
      const workflow = rpaService.updateWorkflow(workflowId, updates);
      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Delete workflow
  deleteWorkflow: async (req, res) => {
    try {
      const { workflowId } = req.params;
      const result = rpaService.deleteWorkflow(workflowId);
      res.json(result);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Execute workflow
  executeWorkflow: async (req, res) => {
    try {
      const { workflowId } = req.params;
      const options = req.body;
      
      const result = await rpaService.executeWorkflow(workflowId, options);
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

  // Demo workflow execution
  demoExecute: async (req, res) => {
    try {
      const { templateId = 'invoice_processing' } = req.body;
      
      // Create a temporary workflow from template
      const template = rpaService.getTemplate(templateId);
      const workflow = rpaService.createWorkflow({
        name: `Demo: ${template.name}`,
        description: template.description,
        steps: template.steps,
        isDemo: true
      });

      // Execute the workflow
      const result = await rpaService.executeWorkflow(workflow.id);

      // Clean up demo workflow
      rpaService.deleteWorkflow(workflow.id);

      res.json({
        success: true,
        data: {
          ...result,
          isDemo: true,
          note: 'This is a demo execution with simulated results.'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Test platform connection
  testConnection: async (req, res) => {
    try {
      const { platformId, credentials } = req.body;
      
      if (!platformId) {
        return res.status(400).json({
          success: false,
          error: 'Platform ID is required'
        });
      }

      const result = await rpaService.testConnection(platformId, credentials);
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

  // Get run history
  getRunHistory: async (req, res) => {
    try {
      const { workflowId, limit } = req.query;
      const history = rpaService.getRunHistory(workflowId, limit ? parseInt(limit) : 50);
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get Docker configuration
  getDockerConfig: async (req, res) => {
    try {
      const { scalability, queueType } = req.query;
      const config = rpaService.getDockerConfig({ scalability, queueType });
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

  // Get schedule configuration options
  getScheduleConfig: async (req, res) => {
    try {
      const config = rpaService.getScheduleConfig();
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
  }
};

module.exports = rpaController;

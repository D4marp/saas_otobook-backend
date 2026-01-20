/**
 * OCR Controller - Handles OCR API requests
 */

const ocrService = require('../services/ocrService');

const ocrController = {
  // Get all OCR providers
  getProviders: async (req, res) => {
    try {
      const providers = ocrService.getProviders();
      res.json({
        success: true,
        data: providers
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get specific provider info
  getProvider: async (req, res) => {
    try {
      const { providerId } = req.params;
      const provider = ocrService.getProvider(providerId);
      res.json({
        success: true,
        data: provider
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  // Process image with OCR
  processImage: async (req, res) => {
    try {
      const { imageData, provider, language, outputFormat, enhanceImage } = req.body;
      
      if (!imageData) {
        return res.status(400).json({
          success: false,
          error: 'Image data is required'
        });
      }

      const result = await ocrService.processImage(imageData, {
        provider,
        language,
        outputFormat,
        enhanceImage
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Demo OCR - no image required
  demoOCR: async (req, res) => {
    try {
      const { provider = 'tesseract', language = 'eng', outputFormat = 'text' } = req.body;
      
      const result = await ocrService.processImage('demo_image', {
        provider,
        language,
        outputFormat,
        enhanceImage: false
      });

      res.json({
        ...result,
        isDemo: true,
        note: 'This is a demo result. In production, upload actual images for processing.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Batch process images
  batchProcess: async (req, res) => {
    try {
      const { images, provider, language, outputFormat } = req.body;
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Images array is required'
        });
      }

      const result = await ocrService.batchProcess(images, {
        provider,
        language,
        outputFormat
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Extract structured data (tables, forms)
  extractStructuredData: async (req, res) => {
    try {
      const { imageData, provider, dataType } = req.body;
      
      const result = await ocrService.extractStructuredData(imageData, {
        provider,
        dataType
      });

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

  // Get platform-specific configuration
  getPlatformConfig: async (req, res) => {
    try {
      const { platform } = req.params;
      const config = ocrService.getPlatformConfig(platform);
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

  // Get Docker deployment configuration
  getDockerConfig: async (req, res) => {
    try {
      const { provider, scalability } = req.query;
      const config = ocrService.getDockerConfig({ provider, scalability });
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

  // Compare providers
  compareProviders: async (req, res) => {
    try {
      const providers = ocrService.getProviders();
      const comparison = providers.map(p => ({
        id: p.id,
        name: p.name,
        features: p.features,
        pricing: p.pricing,
        formats: p.supportedFormats.length,
        recommended: p.id === 'google_vision'
      }));

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = ocrController;

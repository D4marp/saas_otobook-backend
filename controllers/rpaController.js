/**
 * RPA Controller - Handles RPA API requests
 */

const rpaService = require('../services/rpaService');
const { pool, supabaseAdminClient } = require('../config/database');
const ocrService = require('../services/ocrService');
const pdfParse = require('pdf-parse');

const findInvoiceFields = (text = '') => {
  const normalized = text.replace(/\r/g, '\n');

  const supplierLabeled = normalized.match(/(?:supplier|vendor|from|bill to|penjual)\s*[:\-]\s*([^\n]+)/i);
  const supplierLine = normalized.match(/\bPT\.?\s+[A-Z0-9&.,\-\s]{2,}/i);
  const supplier = (supplierLabeled && supplierLabeled[1])
    ? supplierLabeled[1].trim()
    : (supplierLine ? supplierLine[0].trim() : 'Tidak terdeteksi');

  const amountLabeled = normalized.match(/(?:grand\s*total|total\s*bayar|total|amount|jumlah)\s*[:\-]?\s*((?:rp\.?\s?)?[\d][\d.,]*)/i);
  const amountFallback = normalized.match(/(?:rp\.?\s?)[\d][\d.,]*/i);
  const amount = (amountLabeled && amountLabeled[1])
    ? amountLabeled[1].trim()
    : (amountFallback ? amountFallback[0].trim() : 'Tidak terdeteksi');

  const dateLabeled = normalized.match(/(?:invoice\s*date|date|tanggal)\s*[:\-]?\s*(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  const dateFallback = normalized.match(/\b(\d{4}[\/\-]\d{2}[\/\-]\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
  const date = (dateLabeled && dateLabeled[1])
    ? dateLabeled[1].trim()
    : (dateFallback ? dateFallback[1].trim() : 'Tidak terdeteksi');

  return { supplier, amount, date };
};

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
  },

  // Save invoice pipeline run to database
  saveInvoiceRun: async (req, res) => {
    let client;
    try {
      const {
        messageKey,
        workflowName,
        invoiceFile,
        summary,
        extractedData,
        steps
      } = req.body;

      if (!messageKey || !workflowName || !invoiceFile?.name) {
        return res.status(400).json({
          success: false,
          error: 'messageKey, workflowName, and invoiceFile.name are required'
        });
      }

      // Try Supabase first, fallback to PostgreSQL
      let runId;
      const data = {
        message_key: messageKey,
        workflow_name: workflowName,
        invoice_file_name: invoiceFile.name,
        invoice_file_size: invoiceFile.size || 0,
        total_steps: summary?.stepsTotal || 0,
        completed_steps: summary?.stepsCompleted || 0,
        total_time_ms: summary?.totalTime || 0,
        status: summary?.success ? 'success' : 'failed',
        supplier_name: extractedData?.supplier || null,
        invoice_amount: extractedData?.amount || null,
        invoice_date: extractedData?.date || null,
        raw_steps: JSON.stringify(steps || [])
      };

      if (supabaseAdminClient) {
        try {
          console.log('Attempting to save to Supabase with admin client...');
          const { data: result, error } = await supabaseAdminClient
            .from('rpa_invoice_runs')
            .insert([data])
            .select();
          
          if (error) throw error;
          runId = result[0]?.id;
          console.log('✅ Successfully saved to Supabase, runId:', runId);
        } catch (supabaseError) {
          console.warn('⚠️  Supabase save failed:', supabaseError.message);
          console.log('Falling back to PostgreSQL pool...');
          
          client = await pool.connect();
          const result = await client.query(
            `INSERT INTO rpa_invoice_runs (
              message_key,
              workflow_name,
              invoice_file_name,
              invoice_file_size,
              total_steps,
              completed_steps,
              total_time_ms,
              status,
              supplier_name,
              invoice_amount,
              invoice_date,
              raw_steps
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
              messageKey,
              workflowName,
              invoiceFile.name,
              invoiceFile.size || 0,
              summary?.stepsTotal || 0,
              summary?.stepsCompleted || 0,
              summary?.totalTime || 0,
              summary?.success ? 'success' : 'failed',
              extractedData?.supplier || null,
              extractedData?.amount || null,
              extractedData?.date || null,
              JSON.stringify(steps || [])
            ]
          );
          runId = result.rows[0]?.id;
          console.log('✅ Successfully saved to PostgreSQL, runId:', runId);
        }
      } else {
        // Use PostgreSQL pool if Supabase not available
        client = await pool.connect();
        const result = await client.query(
          `INSERT INTO rpa_invoice_runs (
            message_key,
            workflow_name,
            invoice_file_name,
            invoice_file_size,
            total_steps,
            completed_steps,
            total_time_ms,
            status,
            supplier_name,
            invoice_amount,
            invoice_date,
            raw_steps
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING id`,
          [
            messageKey,
            workflowName,
            invoiceFile.name,
            invoiceFile.size || 0,
            summary?.stepsTotal || 0,
            summary?.stepsCompleted || 0,
            summary?.totalTime || 0,
            summary?.success ? 'success' : 'failed',
            extractedData?.supplier || null,
            extractedData?.amount || null,
            extractedData?.date || null,
            JSON.stringify(steps || [])
          ]
        );
        runId = result.rows[0]?.id;
        console.log('✅ Successfully saved to PostgreSQL pool, runId:', runId);
      }

      res.status(201).json({
        success: true,
        data: {
          runId: runId || 0,
          database: supabaseAdminClient ? 'supabase' : 'postgresql',
          table: 'rpa_invoice_runs',
          messageKey
        }
      });
    } catch (error) {
      console.error('Error saving invoice run:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    } finally {
      if (client) client.release();
    }
  },

  // Extract invoice fields from real file content (PDF text or image OCR)
  extractInvoiceData: async (req, res) => {
    try {
      const { fileName, mimeType, fileData, language = 'eng' } = req.body;

      if (!fileName || !fileData) {
        return res.status(400).json({
          success: false,
          error: 'fileName and fileData are required'
        });
      }

      const isPdf = (mimeType || '').includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

      let extractedText = '';
      let source = 'pdf_text';
      let confidence = null;
      let extractionError = null;

      if (isPdf) {
        try {
          const buffer = Buffer.from(fileData, 'base64');
          const pdfResult = await pdfParse(buffer);
          extractedText = (pdfResult.text || '').trim();
        } catch (error) {
          extractionError = `PDF parse failed: ${error.message}`;
          extractedText = '';
        }
      } else {
        try {
          const dataUrl = `data:${mimeType || 'image/png'};base64,${fileData}`;
          const ocrResult = await ocrService.processImage(dataUrl, {
            language,
            outputFormat: 'text',
            mode: 'accurate'
          });

          extractedText = (ocrResult && ocrResult.result && ocrResult.result.text ? ocrResult.result.text : '').trim();
          source = 'ocr_image';
          confidence = ocrResult && typeof ocrResult.confidence === 'number' ? ocrResult.confidence : null;
        } catch (error) {
          extractionError = `OCR extraction failed: ${error.message}`;
          extractedText = '';
        }
      }

      const fields = findInvoiceFields(extractedText);

      res.json({
        success: true,
        data: {
          ...fields,
          rawTextPreview: extractedText.slice(0, 1200),
          source,
          confidence,
          extractionError
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

module.exports = rpaController;

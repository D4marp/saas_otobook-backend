const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { pool, initializeDatabase } = require('./config/database');
const userRoutes = require('./routes/users');
const documentationRoutes = require('./routes/documentation');
const ocrRoutes = require('./routes/ocr');
const rpaRoutes = require('./routes/rpa');
const platformRoutes = require('./routes/platform');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', userRoutes);
app.use('/api', documentationRoutes);
app.use('/api', ocrRoutes);
app.use('/api', rpaRoutes);
app.use('/api', platformRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running', timestamp: new Date() });
});

// API Overview
app.get('/api', (req, res) => {
  res.json({
    name: 'Otobook SaaS API',
    version: '1.0.0',
    description: 'Multi-platform OCR & RPA Service API',
    endpoints: {
      ocr: {
        description: 'OCR Service API',
        base: '/api/ocr',
        routes: [
          'GET /providers - List all OCR providers',
          'GET /providers/:id - Get provider details',
          'POST /demo - Demo OCR processing',
          'POST /process - Process image with OCR',
          'POST /batch - Batch process images',
          'POST /extract - Extract structured data'
        ]
      },
      rpa: {
        description: 'RPA Service API',
        base: '/api/rpa',
        routes: [
          'GET /actions - List all action types',
          'GET /platforms - List all platforms',
          'GET /templates - List workflow templates',
          'POST /workflows - Create workflow',
          'GET /workflows - List workflows',
          'POST /workflows/:id/execute - Execute workflow',
          'POST /demo - Demo workflow execution'
        ]
      },
      platform: {
        description: 'Platform Integration API',
        base: '/api/platform',
        routes: [
          'GET /integrations - List available integrations',
          'POST /connections - Create platform connection',
          'GET /connections - List connections',
          'POST /deployments - Create deployment',
          'POST /generate/docker-compose - Generate Docker config',
          'POST /demo-deploy - Demo deployment'
        ]
      }
    },
    documentation: '/api/docs'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
      console.log(`💾 Database: ${process.env.DB_NAME}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;

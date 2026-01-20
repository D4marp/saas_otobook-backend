const { pool } = require('../config/database');

// Get all documentation
exports.getAllDocumentation = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [docs] = await connection.query('SELECT * FROM documentation ORDER BY type, id');
    connection.release();
    
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documentation'
    });
  }
};

// Get documentation by type (OCR or RPA)
exports.getDocumentationByType = async (req, res) => {
  try {
    const { type } = req.params;
    const connection = await pool.getConnection();
    const [docs] = await connection.query('SELECT * FROM documentation WHERE type = ? ORDER BY id', [type]);
    connection.release();
    
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documentation'
    });
  }
};

// Seed documentation data
exports.seedDocumentation = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('TRUNCATE TABLE documentation');
    
    const ocrDocs = [
      {
        type: 'OCR',
        title: 'Web OCR Implementation',
        platform: 'Web',
        description: 'Tesseract.js for browser-based OCR',
        content: 'Implement OCR on web using Tesseract.js library'
      },
      {
        type: 'OCR',
        title: 'Android OCR Implementation',
        platform: 'Android',
        description: 'MLKit Vision for Android OCR',
        content: 'Use Google MLKit Vision for Android implementation'
      },
      {
        type: 'OCR',
        title: 'iOS OCR Implementation',
        platform: 'iOS',
        description: 'Vision framework for iOS OCR',
        content: 'Apple Vision framework for iOS implementation'
      }
    ];
    
    const rpaDocs = [
      {
        type: 'RPA',
        title: 'Robot Framework Installation',
        platform: 'General',
        description: 'Complete Robot Framework setup guide',
        content: 'Step-by-step installation and configuration'
      },
      {
        type: 'RPA',
        title: 'Robot Framework Basics',
        platform: 'General',
        description: 'Learn Robot Framework fundamentals',
        content: 'Keywords, test cases, and basic syntax'
      },
      {
        type: 'RPA',
        title: 'Advanced RPA Techniques',
        platform: 'General',
        description: 'Advanced Robot Framework features',
        content: 'Custom libraries, API testing, database operations'
      },
      {
        type: 'RPA',
        title: 'CI/CD Integration',
        platform: 'General',
        description: 'Integrate Robot Framework with CI/CD',
        content: 'GitHub Actions, Jenkins, Docker, and OTobook SaaS'
      }
    ];
    
    const allDocs = [...ocrDocs, ...rpaDocs];
    
    for (const doc of allDocs) {
      await connection.query(
        'INSERT INTO documentation (type, title, platform, description, content) VALUES (?, ?, ?, ?, ?)',
        [doc.type, doc.title, doc.platform, doc.description, doc.content]
      );
    }
    
    connection.release();
    
    res.json({
      success: true,
      message: `${allDocs.length} documentation entries seeded successfully`
    });
  } catch (error) {
    console.error('Error seeding documentation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed documentation'
    });
  }
};

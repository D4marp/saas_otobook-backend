const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client (anon key for frontend-safe access)
let supabaseClient = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  try {
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client (anon) initialized');
  } catch (err) {
    console.warn('⚠️  Supabase client initialization failed:', err.message);
  }
}

// Initialize Supabase admin client (service role key for backend operations with higher privilege)
let supabaseAdminClient = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseAdminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    console.log('✅ Supabase admin client (service role) initialized');
  } catch (err) {
    console.warn('⚠️  Supabase admin client initialization failed:', err.message);
  }
}

// Parse PostgreSQL connection URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Initialize database tables
const initializeDatabase = async () => {
  if (supabaseAdminClient) {
    console.log('ℹ️  Supabase admin client available; skipping pg bootstrap check.');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        role VARCHAR(50) DEFAULT 'User',
        status VARCHAR(50) DEFAULT 'Active',
        phone VARCHAR(20),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create documentation table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documentation (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        platform VARCHAR(50),
        content TEXT,
        code_examples JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create features table
    await client.query(`
      CREATE TABLE IF NOT EXISTS features (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100),
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create RPA invoice run log table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rpa_invoice_runs (
        id BIGSERIAL PRIMARY KEY,
        message_key VARCHAR(255) NOT NULL,
        workflow_name VARCHAR(255) NOT NULL,
        invoice_file_name VARCHAR(255) NOT NULL,
        invoice_file_size INT,
        total_steps INT DEFAULT 0,
        completed_steps INT DEFAULT 0,
        total_time_ms INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'success',
        supplier_name VARCHAR(255),
        invoice_amount VARCHAR(100),
        invoice_date VARCHAR(50),
        raw_steps JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rpa_invoice_message_key ON rpa_invoice_runs(message_key)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rpa_invoice_created_at ON rpa_invoice_runs(created_at)
    `);

    console.log('PostgreSQL database initialized successfully');
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
};

module.exports = { pool, supabaseClient, supabaseAdminClient, initializeDatabase };

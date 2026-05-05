-- Migration: 00001_create_tables.sql
-- Create initial tables for Otobook

CREATE TABLE IF NOT EXISTS public.users (
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
);

CREATE TABLE IF NOT EXISTS public.documentation (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(50),
  content TEXT,
  code_examples JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.features (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100),
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.rpa_invoice_runs (
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
);

CREATE INDEX IF NOT EXISTS idx_rpa_invoice_message_key ON public.rpa_invoice_runs(message_key);
CREATE INDEX IF NOT EXISTS idx_rpa_invoice_created_at ON public.rpa_invoice_runs(created_at);

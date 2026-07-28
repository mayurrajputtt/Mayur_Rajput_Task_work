-- ==============================================================================
-- AiVoA PharmaQMS - Normalized PostgreSQL Database Schema (3NF)
-- Designed for FDA 21 CFR Part 11 Compliance & ICH Q9 Quality Risk Management
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    can_approve_capa BOOLEAN DEFAULT FALSE,
    can_sign_investigations BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) REFERENCES roles(id),
    department VARCHAR(100),
    esign_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);

-- 3. Products Table (API & FDF Catalog)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    product_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    grade VARCHAR(100) NOT NULL, -- e.g., 'API Raw Material' or 'USP 40mg FDF'
    ndc_code VARCHAR(100),
    formulation_type VARCHAR(100), -- Tablet, Capsule, Vial, Suspension
    active_ingredient VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_grade ON products(grade);

-- 4. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    customer_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100), -- Hospital, Distributor, Pharmacy, Physician
    contact_email VARCHAR(255),
    contact_phone VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

-- 5. Complaints Table (Core QMS Module)
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY, -- e.g., CMP-2026-0089
    complaint_code VARCHAR(100) UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    product_id VARCHAR(50) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    product_grade VARCHAR(100),
    batch_number VARCHAR(100) NOT NULL,
    manufacturing_date DATE,
    expiry_date DATE,
    quantity_affected VARCHAR(100),
    complaint_type VARCHAR(100) NOT NULL,
    complaint_date DATE NOT NULL,
    description TEXT NOT NULL,
    initial_severity VARCHAR(50) DEFAULT 'Medium',
    priority VARCHAR(50) DEFAULT 'Standard',
    status VARCHAR(100) DEFAULT 'PENDING_TRIAGE',
    assigned_to VARCHAR(50) REFERENCES users(id),
    completeness_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_batch ON complaints(batch_number);
CREATE INDEX IF NOT EXISTS idx_complaints_date ON complaints(complaint_date);

-- 6. Attachments Table (PDFs, .eml, Images)
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- PDF, EML, IMAGE
    file_size_bytes INTEGER,
    storage_url VARCHAR(500),
    ocr_extracted_text TEXT,
    uploaded_by VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attachments_complaint ON attachments(complaint_id);

-- 7. Risk Assessments Table (ICH Q9 Guidelines)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE UNIQUE,
    ich_risk_class VARCHAR(50) NOT NULL, -- CRITICAL_CLASS_I, MAJOR_CLASS_II, MINOR_CLASS_III
    severity VARCHAR(50) NOT NULL,
    risk_score INTEGER NOT NULL,
    ich_justification TEXT NOT NULL,
    assessed_by VARCHAR(50) REFERENCES users(id),
    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_risk_class ON risk_assessments(ich_risk_class);

-- 8. AI Summaries & Vector Embeddings Table
CREATE TABLE IF NOT EXISTS ai_summaries (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE UNIQUE,
    executive_summary TEXT NOT NULL,
    ishikawa_rca_json TEXT,
    confidence_score FLOAT DEFAULT 0.95,
    duplicate_probability FLOAT DEFAULT 0.0,
    matched_complaint_id VARCHAR(50),
    embeddings TEXT, -- Stored as JSON float array or vector(768)
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_complaint ON ai_summaries(complaint_id);

-- 9. CAPA Table (Corrective & Preventive Actions)
CREATE TABLE IF NOT EXISTS capa (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- Corrective | Preventive
    description TEXT NOT NULL,
    owner VARCHAR(100) NOT NULL,
    target_days INTEGER DEFAULT 14,
    status VARCHAR(50) DEFAULT 'PROPOSED',
    approved_by VARCHAR(50) REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_capa_complaint ON capa(complaint_id);
CREATE INDEX IF NOT EXISTS idx_capa_status ON capa(status);

-- 10. Audit Logs Table (FDA 21 CFR Part 11 Immutable Electronic Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) REFERENCES complaints(id),
    user_id VARCHAR(50) REFERENCES users(id),
    user_email VARCHAR(255),
    action_type VARCHAR(100) NOT NULL, -- CREATE, STATUS_CHANGE, RISK_OVERRIDE, CAPA_APPROVE, ESIGN
    previous_value TEXT,
    new_value TEXT,
    esign_reason VARCHAR(255),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_complaint ON audit_logs(complaint_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);

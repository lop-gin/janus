-- Improved Database Schema for Manufacturing Management System

-- Companies Table (First to avoid circular references)
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    tax_id VARCHAR(50),
    company_type VARCHAR(20) CHECK (company_type IN ('manufacturer', 'distributor', 'both')),
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    auth_user_id UUID REFERENCES auth.users(id) UNIQUE
);

-- Roles Table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(company_id, role_name)
);

-- User Roles Junction Table
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

-- Modules Table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default modules
INSERT INTO modules (name, description) VALUES
('Sales', 'Sales module including invoices, receipts, and customer management'),
('Purchasing', 'Purchasing module including purchase orders and supplier management'),
('Production', 'Production module for tracking manufacturing processes'),
('Packaging', 'Packaging module for tracking product packaging'),
('Transport', 'Transport module for tracking internal product movement'),
('Warehouse', 'Warehouse module for inventory management'),
('Reports', 'Reporting and analytics module'),
('Settings', 'System settings and configuration');


-- SQL functions to temporarily disable and enable RLS for tables
-- These functions should be added to your Supabase database

-- Function to disable RLS for tables
CREATE OR REPLACE FUNCTION disable_rls_for_tables()
RETURNS void AS $$
BEGIN
  ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to enable RLS for tables
CREATE OR REPLACE FUNCTION enable_rls_for_tables()
RETURNS void AS $$
BEGIN
  ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SQL function to execute raw SQL queries
-- Modified execute_sql function to return proper result format
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- For INSERT statements that return values, we need to handle the result differently
    IF sql_query ~* 'INSERT.*RETURNING' THEN
        EXECUTE sql_query INTO STRICT result;
        -- If result is not already JSONB, convert it
        IF pg_typeof(result) <> 'jsonb'::regtype THEN
            result := to_jsonb(result);
        END IF;
    ELSE
        EXECUTE sql_query;
        result := '{"success": true}'::JSONB;
    END IF;

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'error', SQLERRM,
        'detail', SQLSTATE,
        'query', sql_query
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
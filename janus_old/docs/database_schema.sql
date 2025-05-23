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

-- Add to your SQL schema or run in Supabase SQL editor







-- Function to register company and user after email confirmation
CREATE OR REPLACE FUNCTION public.register_company_and_user_after_confirm()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id INTEGER;
    v_user_id INTEGER;
    v_role_id INTEGER;
BEGIN
    -- Insert into companies using metadata stored in auth.users.raw_user_meta_data during signup
    INSERT INTO public.companies (name, email, phone, address, company_type)
    VALUES (
        NEW.raw_user_meta_data->>'company_name', -- Extract company_name from metadata
        NEW.email,                               -- Use the confirmed email
        NEW.raw_user_meta_data->>'phone',        -- Extract phone from metadata
        NEW.raw_user_meta_data->>'address',      -- Extract address from metadata
        COALESCE(NEW.raw_user_meta_data->>'company_type', 'manufacturer') -- Default to 'manufacturer' if not provided
    )
    RETURNING id INTO v_company_id;

    -- Insert into users, linking to the newly created company
    INSERT INTO public.users (company_id, name, email, auth_user_id, password_hash, is_active)
    VALUES (
        v_company_id,
        NEW.raw_user_meta_data->>'full_name', -- Extract full_name from metadata
        NEW.email,                            -- Use the confirmed email
        NEW.id,                               -- Link to the auth.users record
        'managed_by_supabase',                -- Placeholder since password is managed by Supabase Auth
        TRUE                                  -- Activate the user immediately
    )
    RETURNING id INTO v_user_id;

    -- Insert into roles (Super Admin role for the new user)
    INSERT INTO public.roles (company_id, role_name, description, permissions, is_system_role, created_by, updated_by)
    VALUES (
        v_company_id,
        'Super Admin',
        'Company owner with full system access',
        '{"all_modules": true, "permissions": {"sales": ["view", "create", "edit", "delete"], "purchasing": ["view", "create", "edit", "delete"], "production": ["view", "create", "edit", "delete"], "packaging": ["view", "create", "edit", "delete"], "transport": ["view", "create", "edit", "delete"], "warehouse": ["view", "create", "edit", "delete"], "reports": ["view", "create", "edit", "delete"], "settings": ["view", "create", "edit", "delete"]}}'::jsonb,
        TRUE,                                 -- Mark as a system role
        v_user_id,                            -- Created by the new user
        v_user_id                             -- Updated by the new user
    )
    RETURNING id INTO v_role_id;

    -- Link the user to the Super Admin role
    INSERT INTO public.user_roles (user_id, role_id, created_by)
    VALUES (v_user_id, v_role_id, v_user_id);

    RETURN NEW; -- Return the updated auth.users row
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run the function after email confirmation
CREATE TRIGGER user_confirmed_trigger
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL) -- Trigger only when confirmed_at is set
EXECUTE FUNCTION public.register_company_and_user_after_confirm();

-- Grant permissions to the supabase_auth_admin role to execute this function
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.register_company_and_user_after_confirm() TO supabase_auth_admin;







-- Define Enums (assumed missing in original SQL)
CREATE TYPE transaction_type AS ENUM (
    'invoice',
    'sales_receipt',
    'credit_note',
    'refund_receipt',
    'estimate'
);

CREATE TYPE payment_status AS ENUM (
    'due',
    'partially_paid',
    'paid',
    'overpaid',
    'void',
    'canceled'
);

-- Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    email VARCHAR(100),
    billing_address TEXT,
    initial_balance DECIMAL(12,2) DEFAULT 0,
    -- Optional: balance DECIMAL(12,2) DEFAULT 0, -- Uncomment if you want to track balance
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories Table (unchanged)
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    sku VARCHAR(50),
    description TEXT,
    primary_unit_of_measure VARCHAR(20) NOT NULL,
    secondary_unit_of_measure VARCHAR(20),
    conversion_factor DECIMAL(12,4),
    default_tax_percent DECIMAL(5,2),
    initial_quantity DECIMAL(12,3) DEFAULT 0,
    as_of_date DATE,
    reorder_point DECIMAL(12,3),
    sale_price DECIMAL(12,2),
    purchase_price DECIMAL(12,2),
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    transaction_number VARCHAR(20) NOT NULL,
    transaction_type transaction_type NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    sales_rep_id INTEGER REFERENCES users(id),
    transaction_date DATE NOT NULL,
    due_date DATE,
    expiration_date DATE,
    terms VARCHAR(50),
    status payment_status DEFAULT 'due',
    message TEXT,
    net_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
    gross_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    parent_transaction_id INTEGER REFERENCES transactions(id),
    deleted_at TIMESTAMPTZ, -- Added for soft deletes
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transaction Items (unchanged)
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(12,3) NOT NULL,
    unit_of_measure VARCHAR(20) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    tax_percent DECIMAL(5,2) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments Table (rename amount_to_credit for clarity)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    payment_number VARCHAR(20) NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    payment_date DATE NOT NULL,
    amount_received DECIMAL(12,2) NOT NULL,
    unallocated_amount DECIMAL(12,2) DEFAULT 0, -- Renamed from amount_to_credit
    message TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Allocations (unchanged)
CREATE TABLE payment_allocations (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id),
    amount DECIMAL(12,2) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    updated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Log (unchanged)
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
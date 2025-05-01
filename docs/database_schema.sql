-- Create ENUM for role colors (expanded list)
CREATE TYPE role_color AS ENUM (
    'blue', 'green', 'red', 'purple', 'teal', 'orange',
    'yellow', 'pink', 'cyan', 'gray', 'indigo', 'violet'
);

-- Companies Table (unchanged from your schema)
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

-- Users Table (updated to ensure phone and gender are included)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL DEFAULT 'managed_by_supabase',
    is_active BOOLEAN DEFAULT TRUE,
    phone VARCHAR(50), -- Already present in your schema
    gender VARCHAR(20), -- Added for user management
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    auth_user_id UUID REFERENCES auth.users(id) UNIQUE
);

COMMENT ON TABLE users IS 'Stores user information, linked to Supabase Auth and company';
COMMENT ON COLUMN users.auth_user_id IS 'References the Supabase Auth user ID';
COMMENT ON COLUMN users.password_hash IS 'Placeholder; passwords are managed by Supabase Auth';

-- Roles Table (added color field with role_color ENUM)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB, -- Supports Employee section permissions
    is_system_role BOOLEAN DEFAULT FALSE,
    color role_color NOT NULL, -- New field for UI display
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    UNIQUE(company_id, role_name)
);

COMMENT ON TABLE roles IS 'Stores roles with permissions and company association';
COMMENT ON COLUMN roles.permissions IS 'JSONB field storing permissions (e.g., {"employee": {"user_management": ["view", "create"], "role_management": ["view"]}})';
COMMENT ON COLUMN roles.is_system_role IS 'If true, role cannot be modified or deleted (e.g., Super Admin)';
COMMENT ON COLUMN roles.color IS 'UI color for the role, using role_color ENUM';

-- User Roles Junction Table (unchanged)
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by INTEGER REFERENCES users(id),
    UNIQUE(user_id, role_id)
);

COMMENT ON TABLE user_roles IS 'Assigns roles to users, linking users and roles tables';

-- Activity Log Table (using your structure, with optional details JSONB)
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL, -- e.g., 'create_role', 'invite_user'
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'role', 'user'
    entity_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    details JSONB, -- Optional for additional data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Logs actions performed on roles and users for auditing';
COMMENT ON COLUMN activity_log.details IS 'Optional JSONB field for action-specific details';

-- Modules Table (unchanged)
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default modules (unchanged)
INSERT INTO modules (name, description) VALUES
('Sales', 'Sales module including invoices, receipts, and customer management'),
('Purchasing', 'Purchasing module including purchase orders and supplier management'),
('Production', 'Production module for tracking manufacturing processes'),
('Packaging', 'Packaging module for tracking product packaging'),
('Transport', 'Transport module for tracking internal product movement'),
('Warehouse', 'Warehouse module for inventory management'),
('Reports', 'Reporting and analytics module'),
('Settings', 'System settings and configuration');

-- Enums (unchanged)
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

-- Customers Table (unchanged)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    email VARCHAR(100),
    billing_address TEXT,
    initial_balance DECIMAL(12,2) DEFAULT 0,
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

-- Products Table (unchanged)
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

-- Transactions Table (unchanged)
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
    deleted_at TIMESTAMPTZ,
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

-- Payments Table (unchanged)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    payment_number VARCHAR(20) NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    payment_date DATE NOT NULL,
    amount_received DECIMAL(12,2) NOT NULL,
    unallocated_amount DECIMAL(12,2) DEFAULT 0,
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

-- RLS Functions (unchanged)
CREATE OR REPLACE FUNCTION disable_rls_for_tables()
RETURNS void AS $$
BEGIN
  ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION enable_rls_for_tables()
RETURNS void AS $$
BEGIN
  ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute SQL Function (unchanged)
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    IF sql_query ~* 'INSERT.*RETURNING' THEN
        EXECUTE sql_query INTO STRICT result;
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

-- Register Company and User Function/Trigger (unchanged)
CREATE OR REPLACE FUNCTION public.register_company_and_user_after_confirm()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id INTEGER;
    v_user_id INTEGER;
    v_role_id INTEGER;
BEGIN
    INSERT INTO public.companies (name, email, phone, address, company_type)
    VALUES (
        NEW.raw_user_meta_data->>'company_name',
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'address',
        COALESCE(NEW.raw_user_meta_data->>'company_type', 'manufacturer')
    )
    RETURNING id INTO v_company_id;

    INSERT INTO public.users (company_id, name, email, auth_user_id, password_hash, is_active)
    VALUES (
        v_company_id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.id,
        'managed_by_supabase',
        TRUE
    )
    RETURNING id INTO v_user_id;

    INSERT INTO public.roles (company_id, role_name, description, permissions, is_system_role, created_by, updated_by, color)
    VALUES (
        v_company_id,
        'Super Admin',
        'Company owner with full system access',
        '{"all_modules": true, "employee": {"user_management": ["view", "create", "edit", "delete"], "role_management": ["view", "create", "edit", "delete"]}, "sales": ["view", "create", "edit", "delete"], "purchasing": ["view", "create", "edit", "delete"], "production": ["view", "create", "edit", "delete"], "packaging": ["view", "create", "edit", "delete"], "transport": ["view", "create", "edit", "delete"], "warehouse": ["view", "create", "edit", "delete"], "reports": ["view", "create", "edit", "delete"], "settings": ["view", "create", "edit", "delete"]}'::jsonb,
        TRUE,
        v_user_id,
        v_user_id,
        'blue'
    )
    RETURNING id INTO v_role_id;

    INSERT INTO public.user_roles (user_id, role_id, created_by)
    VALUES (v_user_id, v_role_id, v_user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_confirmed_trigger
AFTER UPDATE ON auth.users
FOR EACH ROW
WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.register_company_and_user_after_confirm();

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.register_company_and_user_after_confirm() TO supabase_auth_admin;

-- Create indexes for performance
CREATE INDEX idx_users_company_id ON users (company_id);
CREATE INDEX idx_users_auth_user_id ON users (auth_user_id);
CREATE INDEX idx_roles_company_id ON roles (company_id);
CREATE INDEX idx_user_roles_user_id ON user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);
CREATE INDEX idx_activity_log_company_id ON activity_log (company_id);
CREATE INDEX idx_activity_log_user_id ON activity_log (user_id);

-- Enable Row-Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY users_company_access ON users
    FOR ALL
    TO authenticated
    USING (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY roles_company_access ON roles
    FOR ALL
    TO authenticated
    USING (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    );

CREATE POLICY user_roles_company_access ON user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM users u
            JOIN roles r ON r.id = user_roles.role_id
            WHERE u.auth_user_id = auth.uid()
            AND u.company_id = r.company_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM users u
            JOIN roles r ON r.id = user_roles.role_id
            WHERE u.auth_user_id = auth.uid()
            AND u.company_id = r.company_id
        )
    );

CREATE POLICY activity_log_company_access ON activity_log
    FOR ALL
    TO authenticated
    USING (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        company_id = (
            SELECT company_id
            FROM users u
            WHERE u.auth_user_id = auth.uid()
        )
    );
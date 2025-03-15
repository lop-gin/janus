# Manufacturing ERP System Database Schema

This document outlines the database schema for our manufacturing ERP system. The schema is designed to support all the manufacturing processes and forms described in the requirements, with a focus on flexibility, performance, and data integrity.

## Overview

Our database schema is organized into several logical sections:

1. **Authentication & Authorization** - User accounts, companies, roles, and permissions
2. **Inventory & Products** - Products, raw materials, and inventory management
3. **Purchasing** - Suppliers, purchase orders, and supplier transactions
4. **Production** - Production records, machine operations, and output tracking
5. **Packaging & Transport** - Packaging records and internal transport tracking
6. **Sales** - Customers, invoices, sales receipts, and payment tracking
7. **Warehousing** - Storage locations and inventory movements

## Table Definitions

Below are the SQL definitions for each table in our schema. These can be executed in Supabase to create the database structure.

### Authentication & Authorization Tables

```sql
-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    company_type TEXT NOT NULL CHECK (company_type IN ('manufacturer', 'distributor', 'both')),
    email TEXT,
    phone TEXT,
    address TEXT,
    country TEXT,
    tax_id TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Default roles
INSERT INTO roles (name, description) VALUES
('Owner', 'System owner with full access'),
('Admin', 'Company administrator with full access to company data'),
('Sales Supervisor', 'Supervises sales operations'),
('Sales Rep', 'Handles sales and customer interactions'),
('Procurement Supervisor', 'Supervises procurement operations'),
('Procurement Rep', 'Handles purchasing and supplier interactions'),
('Production Supervisor', 'Supervises production operations'),
('Machine Operator', 'Operates production machinery'),
('Packaging Supervisor', 'Supervises packaging operations'),
('Packaging Person', 'Handles product packaging'),
('Transport Supervisor', 'Supervises internal transport operations'),
('Transport Person', 'Handles internal product transport'),
('Store Supervisor', 'Supervises warehouse operations'),
('Store Person', 'Handles warehouse inventory');

-- User roles junction table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(name)
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

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('view', 'create', 'edit', 'delete')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(module_id, action)
);

-- Role permissions junction table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- User invitations table
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id UUID REFERENCES roles(id),
    invited_by UUID REFERENCES profiles(id),
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(email, company_id)
);
```

### Inventory & Products Tables

```sql
-- Product categories table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Units of measure table
CREATE TABLE units_of_measure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Default units of measure
INSERT INTO units_of_measure (name, abbreviation, is_default) VALUES
('Kilogram', 'kg', TRUE),
('Liter', 'L', FALSE),
('Piece', 'pc', FALSE),
('Meter', 'm', FALSE),
('Box', 'box', FALSE);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_raw_material BOOLEAN DEFAULT FALSE,
    is_finished_good BOOLEAN DEFAULT FALSE,
    primary_unit_id UUID REFERENCES units_of_measure(id),
    secondary_unit_id UUID REFERENCES units_of_measure(id),
    primary_to_secondary_ratio DECIMAL(10, 4),
    reorder_point DECIMAL(10, 4),
    buying_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    preferred_supplier_id UUID,
    expiry_tracking BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name),
    UNIQUE(company_id, sku)
);

-- Storage locations table
CREATE TABLE storage_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Inventory table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES storage_locations(id),
    quantity DECIMAL(10, 4) NOT NULL DEFAULT 0,
    unit_id UUID REFERENCES units_of_measure(id),
    batch_number TEXT,
    expiry_date DATE,
    last_counted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, product_id, location_id, batch_number)
);

-- Inventory transactions table
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    location_id UUID REFERENCES storage_locations(id),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('purchase', 'production', 'packaging', 'transport', 'sale', 'adjustment')),
    reference_id UUID NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    batch_number TEXT,
    expiry_date DATE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Machines table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    location_id UUID REFERENCES storage_locations(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);
```

### Purchasing Tables

```sql
-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    country TEXT,
    tax_id TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Purchase orders table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    po_number TEXT NOT NULL,
    po_date DATE NOT NULL,
    expected_delivery_date DATE,
    shipping_address TEXT,
    procurement_rep_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'partially_received', 'received', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, po_number)
);

-- Purchase order items table
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchases (received goods) table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    purchase_number TEXT NOT NULL,
    purchase_date DATE NOT NULL,
    procurement_rep_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, purchase_number)
);

-- Purchase items table
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    purchase_order_item_id UUID REFERENCES purchase_order_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier credits table
CREATE TABLE supplier_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    purchase_id UUID REFERENCES purchases(id),
    credit_number TEXT NOT NULL,
    credit_date DATE NOT NULL,
    procurement_rep_id UUID REFERENCES profiles(id),
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, credit_number)
);

-- Supplier credit items table
CREATE TABLE supplier_credit_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_credit_id UUID REFERENCES supplier_credits(id) ON DELETE CASCADE,
    purchase_item_id UUID REFERENCES purchase_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Supplier refunds table
CREATE TABLE supplier_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    supplier_credit_id UUID REFERENCES supplier_credits(id),
    refund_number TEXT NOT NULL,
    refund_date DATE NOT NULL,
    procurement_rep_id UUID REFERENCES profiles(id),
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_received DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, refund_number)
);

-- Supplier refund items table
CREATE TABLE supplier_refund_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_refund_id UUID REFERENCES supplier_refunds(id) ON DELETE CASCADE,
    supplier_credit_item_id UUID REFERENCES supplier_credit_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Production Tables

```sql
-- Production records table
CREATE TABLE production_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    production_number TEXT NOT NULL,
    production_date DATE NOT NULL,
    operator_id UUID REFERENCES profiles(id),
    machine_id UUID REFERENCES machines(id),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, production_number)
);

-- Production inputs table
CREATE TABLE production_inputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_record_id UUID REFERENCES production_records(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    location_id UUID REFERENCES storage_locations(id),
    batch_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Production outputs table
CREATE TABLE production_outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    production_record_id UUID REFERENCES production_records(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    location_id UUID REFERENCES storage_locations(id),
    batch_number TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Packaging & Transport Tables

```sql
-- Packaging records table
CREATE TABLE packaging_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    packaging_number TEXT NOT NULL,
    packaging_date DATE NOT NULL,
    packaging_person_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, packaging_number)
);

-- Packaging items table
CREATE TABLE packaging_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    packaging_record_id UUID REFERENCES packaging_records(id) ON DELETE CASCADE,
    from_product_id UUID REFERENCES products(id),
    to_product_id UUID REFERENCES products(id),
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    storage_location_id UUID REFERENCES storage_locations(id),
    batch_number TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transport records table
CREATE TABLE transport_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    transport_number TEXT NOT NULL,
    transport_date DATE NOT NULL,
    transporter_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'completed', 'cancelled')) DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, transport_number)
);

-- Transport items table
CREATE TABLE transport_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transport_record_id UUID REFERENCES transport_records(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    from_location_id UUID REFERENCES storage_locations(id),
    to_location_id UUID REFERENCES storage_locations(id),
    batch_number TEXT,
    expiry_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Sales Tables

```sql
-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    country TEXT,
    tax_id TEXT,
    notes TEXT,
    opening_balance DECIMAL(10, 2) DEFAULT 0,
    opening_balance_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Estimates table
CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    estimate_number TEXT NOT NULL,
    estimate_date DATE NOT NULL,
    expiration_date DATE,
    sales_rep_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')) DEFAULT 'draft',
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    other_fees_description TEXT,
    other_fees_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, estimate_number)
);

-- Estimate items table
CREATE TABLE estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    estimate_id UUID REFERENCES estimates(id),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    payment_term TEXT CHECK (payment_term IN ('net_15', 'net_30', 'net_60', 'due_on_receipt', 'custom')),
    sales_rep_id UUID REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'void')) DEFAULT 'draft',
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    other_fees_description TEXT,
    other_fees_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, invoice_number)
);

-- Invoice items table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    estimate_item_id UUID REFERENCES estimate_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales receipts table
CREATE TABLE sales_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    receipt_number TEXT NOT NULL,
    receipt_date DATE NOT NULL,
    sales_rep_id UUID REFERENCES profiles(id),
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    other_fees_description TEXT,
    other_fees_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, receipt_number)
);

-- Sales receipt items table
CREATE TABLE sales_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_receipt_id UUID REFERENCES sales_receipts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refund receipts table
CREATE TABLE refund_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    sales_receipt_id UUID REFERENCES sales_receipts(id),
    refund_number TEXT NOT NULL,
    refund_date DATE NOT NULL,
    sales_rep_id UUID REFERENCES profiles(id),
    payment_method TEXT,
    reference_number TEXT,
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    other_fees_description TEXT,
    other_fees_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, refund_number)
);

-- Refund receipt items table
CREATE TABLE refund_receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    refund_receipt_id UUID REFERENCES refund_receipts(id) ON DELETE CASCADE,
    invoice_item_id UUID REFERENCES invoice_items(id),
    sales_receipt_item_id UUID REFERENCES sales_receipt_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Credit notes table
CREATE TABLE credit_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    sales_receipt_id UUID REFERENCES sales_receipts(id),
    credit_number TEXT NOT NULL,
    credit_date DATE NOT NULL,
    sales_rep_id UUID REFERENCES profiles(id),
    notes TEXT,
    total_net DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_gross DECIMAL(10, 2) NOT NULL DEFAULT 0,
    other_fees_description TEXT,
    other_fees_amount DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, credit_number)
);

-- Credit note items table
CREATE TABLE credit_note_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_note_id UUID REFERENCES credit_notes(id) ON DELETE CASCADE,
    invoice_item_id UUID REFERENCES invoice_items(id),
    sales_receipt_item_id UUID REFERENCES sales_receipt_items(id),
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity DECIMAL(10, 4) NOT NULL,
    unit_id UUID REFERENCES units_of_measure(id),
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    payment_number TEXT NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT,
    reference_number TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, payment_number)
);

-- Payment allocations table
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

Supabase uses PostgreSQL's Row Level Security (RLS) to control access to data. Below are the RLS policies we'll implement to ensure data security:

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units_of_measure ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_credit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_refund_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;

-- Company access policy (users can only access their own company's data)
CREATE POLICY company_access_policy ON companies
    USING (id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    ));

-- Generic company data access policy (template for most tables)
CREATE POLICY company_data_access_policy ON products
    USING (company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
    ));

-- Similar policies would be created for all tables with company_id
-- We'll implement specific role-based policies in the authentication system
```

## Database Schema Diagram

The database schema is designed with the following relationships:

1. Each company can have multiple users (profiles)
2. Each user can have multiple roles
3. Each role can have multiple permissions
4. Products can be raw materials, finished goods, or both
5. Inventory is tracked by product, location, and batch
6. All transactions (purchases, production, sales) are linked to inventory movements
7. Forms (invoices, purchase orders, etc.) have header and line item tables

This schema supports all the forms and processes described in the requirements, with a focus on data integrity, performance, and flexibility.

## Next Steps

After implementing this database schema, we'll:

1. Set up the authentication system using Supabase Auth
2. Create the core UI components that mimic QuickBooks
3. Implement the manufacturer forms as specified
4. Add role-based access control
5. Implement the analytics dashboard
6. Dockerize the application for deployment

## Notes for Local Development

When setting up this schema locally with Docker:

1. Install Docker Desktop on your machine
2. Clone the project repository
3. Run `docker-compose up` in the project directory
4. Connect to Supabase using the provided credentials
5. Execute the SQL scripts to create the schema

This will give you a fully functional local development environment with Next.js frontend and Supabase backend.

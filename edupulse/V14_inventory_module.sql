BEGIN;

-- ==============================================================================
-- Project      : EduPulse ERP
-- File         : V14_inventory_module.sql
-- Description  : Procurement, Central Stores, Stocks, Asset Issues & Returns
-- Database     : PostgreSQL 18
-- Schema       : public
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Inventory Item Category & Stores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item_category (
    category_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_code VARCHAR(30) UNIQUE NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    is_asset BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS store (
    store_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_code VARCHAR(30) UNIQUE NOT NULL,
    store_name VARCHAR(150) NOT NULL,
    store_location VARCHAR(150) NOT NULL,
    incharge_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(25),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 2. Vendor
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor (
    vendor_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_code VARCHAR(30) UNIQUE NOT NULL,
    vendor_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(20) UNIQUE,
    pan_number VARCHAR(20),
    contact_person VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    vendor_rating NUMERIC(3,2) DEFAULT 4.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Inventory Item & Stock
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_item (
    item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES item_category(category_id) ON DELETE RESTRICT,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'PIECE',
    reorder_level INTEGER NOT NULL DEFAULT 10,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS stock (
    stock_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(store_id) ON DELETE RESTRICT,
    item_id BIGINT NOT NULL REFERENCES inventory_item(item_id) ON DELETE RESTRICT,
    quantity_on_hand INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    unit_purchase_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    last_restocked_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_store_item_stock UNIQUE (store_id, item_id),
    CONSTRAINT chk_stock_qty CHECK (quantity_on_hand >= 0 AND reserved_quantity >= 0)
);

-- ------------------------------------------------------------------------------
-- 4. Purchase Order & Purchase Item
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase (
    purchase_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES vendor(vendor_id) ON DELETE RESTRICT,
    store_id BIGINT NOT NULL REFERENCES store(store_id) ON DELETE RESTRICT,
    po_number VARCHAR(60) UNIQUE NOT NULL,
    po_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    po_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_po_status CHECK (po_status IN ('DRAFT', 'APPROVED', 'SENT_TO_VENDOR', 'PARTIALLY_DELIVERED', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS purchase_item (
    po_item_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    purchase_id BIGINT NOT NULL REFERENCES purchase(purchase_id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES inventory_item(item_id) ON DELETE RESTRICT,
    ordered_quantity INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10,2) NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT uq_po_item UNIQUE (purchase_id, item_id),
    CONSTRAINT chk_po_qty CHECK (ordered_quantity > 0)
);

-- ------------------------------------------------------------------------------
-- 5. Issue & Return
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_issue (
    issue_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(store_id) ON DELETE RESTRICT,
    item_id BIGINT NOT NULL REFERENCES inventory_item(item_id) ON DELETE RESTRICT,
    issue_slip_number VARCHAR(60) UNIQUE NOT NULL,
    issued_quantity INTEGER NOT NULL,
    issued_to_department_id BIGINT REFERENCES department(department_id) ON DELETE SET NULL,
    issued_to_faculty_id BIGINT REFERENCES faculty(faculty_id) ON DELETE SET NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    authorized_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_issue_qty CHECK (issued_quantity > 0)
);

CREATE TABLE IF NOT EXISTS inventory_return (
    return_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES inventory_issue(issue_id) ON DELETE RESTRICT,
    returned_quantity INTEGER NOT NULL,
    return_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    item_condition VARCHAR(50) NOT NULL DEFAULT 'GOOD',
    received_by VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_return_qty CHECK (returned_quantity > 0)
);

-- ------------------------------------------------------------------------------
-- 6. Damage & Loss
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_damage (
    damage_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    store_id BIGINT NOT NULL REFERENCES store(store_id) ON DELETE RESTRICT,
    item_id BIGINT NOT NULL REFERENCES inventory_item(item_id) ON DELETE RESTRICT,
    damaged_quantity INTEGER NOT NULL,
    incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
    damage_reason TEXT NOT NULL,
    loss_valuation NUMERIC(12,2) NOT NULL,
    surveyed_by VARCHAR(150) NOT NULL,
    written_off BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    updated_by VARCHAR(100) DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_damage_qty CHECK (damaged_quantity > 0)
);

COMMIT;

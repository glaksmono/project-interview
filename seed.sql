-- =============================================================
-- B2B E-Commerce + P2P Lending Platform
-- Database Schema + Seed Data
-- Compatible with PostgreSQL 14+
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- SCHEMA
-- =============================================================

CREATE TYPE user_role AS ENUM ('buyer', 'lender');
CREATE TYPE order_status AS ENUM ('pending_funding', 'confirmed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('direct', 'loan');
CREATE TYPE loan_status AS ENUM ('open', 'funded', 'repaid', 'expired');
CREATE TYPE installment_status AS ENUM ('pending', 'paid', 'overdue');

-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL,
    wallet_balance  NUMERIC(15, 2) NOT NULL DEFAULT 50000.00,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           NUMERIC(15, 2) NOT NULL,
    stock_quantity  INTEGER NOT NULL DEFAULT 0,
    category        VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT price_positive CHECK (price > 0),
    CONSTRAINT stock_non_negative CHECK (stock_quantity >= 0)
);

-- Orders
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id        UUID NOT NULL REFERENCES users(id),
    product_id      UUID NOT NULL REFERENCES products(id),
    quantity        INTEGER NOT NULL,
    unit_price      NUMERIC(15, 2) NOT NULL,
    total_amount    NUMERIC(15, 2) NOT NULL,
    payment_method  payment_method NOT NULL,
    status          order_status NOT NULL DEFAULT 'pending_funding',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- Loan Applications
CREATE TABLE loan_applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL UNIQUE REFERENCES orders(id),
    buyer_id            UUID NOT NULL REFERENCES users(id),
    requested_amount    NUMERIC(15, 2) NOT NULL,
    funded_amount       NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    term_months         INTEGER NOT NULL,
    interest_rate       NUMERIC(5, 4) NOT NULL,
    status              loan_status NOT NULL DEFAULT 'open',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT term_valid CHECK (term_months BETWEEN 1 AND 12),
    CONSTRAINT funded_not_exceed_requested CHECK (funded_amount <= requested_amount)
);

-- Loan Fundings (individual lender contributions)
CREATE TABLE loan_fundings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id     UUID NOT NULL REFERENCES loan_applications(id),
    lender_id               UUID NOT NULL REFERENCES users(id),
    amount                  NUMERIC(15, 2) NOT NULL,
    funded_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT funding_amount_positive CHECK (amount > 0)
);

-- Repayment Installments
CREATE TABLE repayment_installments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id     UUID NOT NULL REFERENCES loan_applications(id),
    installment_number      INTEGER NOT NULL,
    amount                  NUMERIC(15, 2) NOT NULL,
    due_date                DATE NOT NULL,
    status                  installment_status NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (loan_application_id, installment_number)
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_buyer_id ON loan_applications(buyer_id);
CREATE INDEX idx_loan_fundings_loan_application_id ON loan_fundings(loan_application_id);
CREATE INDEX idx_loan_fundings_lender_id ON loan_fundings(lender_id);
CREATE INDEX idx_repayment_installments_loan_application_id ON repayment_installments(loan_application_id);

-- =============================================================
-- SEED DATA — PRODUCTS
-- 12 products across 4 categories
-- =============================================================

INSERT INTO products (name, description, price, stock_quantity, category) VALUES

-- Machinery
('Industrial Water Pump',
 'Heavy-duty centrifugal pump rated for 500 GPM. Suitable for construction sites and large-scale irrigation.',
 4500.00, 15, 'machinery'),

('Electric Motor 50HP',
 'Three-phase induction motor, 50 horsepower, 1800 RPM. IP55 rated for outdoor use.',
 3200.00, 8, 'machinery'),

('Hydraulic Press 20-Ton',
 'H-frame hydraulic press with 20-ton capacity. Includes pressure gauge and safety relief valve.',
 7800.00, 5, 'machinery'),

('Industrial Air Compressor',
 'Rotary screw compressor, 100 CFM output, 150 PSI max. Suitable for continuous industrial use.',
 5500.00, 10, 'machinery'),

-- Raw Materials
('Steel Rod Bundle (1 Ton)',
 'Deformed steel reinforcement bars, 12mm diameter, 1-ton bundle. Grade 60.',
 1200.00, 50, 'raw-materials'),

('Copper Wire Roll 100m',
 'Pure copper conductor wire, 10mm² cross-section, PVC insulated. 100-meter roll.',
 850.00, 30, 'raw-materials'),

('Aluminum Sheet 4x8ft',
 '6061-T6 aluminum alloy sheet, 4x8 feet, 3mm thickness. Suitable for fabrication.',
 320.00, 100, 'raw-materials'),

('PVC Pipe Bundle (50 pcs)',
 'Schedule 40 PVC pipes, 3-inch diameter, 10-foot length. Bundle of 50 pieces.',
 480.00, 40, 'raw-materials'),

-- Office & Warehouse
('Heavy-Duty Shelving Unit',
 'Industrial steel shelving unit, 5 tiers, 2000 lb total capacity. 72"H x 48"W x 24"D.',
 680.00, 25, 'office-warehouse'),

('Electric Pallet Jack',
 'Ride-on electric pallet jack, 4500 lb capacity, 48V battery. Includes charger.',
 6200.00, 6, 'office-warehouse'),

('Laser Printer (Business)',
 'High-speed monochrome laser printer, 65 PPM, duplex printing, 550-sheet tray. Network ready.',
 1100.00, 20, 'office-warehouse'),

-- Safety & PPE
('Safety Helmet Bulk Pack (50 pcs)',
 'ANSI/ISEA Z89.1 Class E certified hard hats. Vented design. Pack of 50 in assorted colors.',
 420.00, 60, 'safety-ppe');

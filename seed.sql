-- =============================================================
-- B2B E-Commerce + P2P Lending Platform (Indonesia)
-- Database Schema + Seed Data
-- Currency: Indonesian Rupiah (IDR)
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
    wallet_balance  NUMERIC(15, 0) NOT NULL DEFAULT 500000000,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           NUMERIC(15, 0) NOT NULL,
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
    unit_price      NUMERIC(15, 0) NOT NULL,
    total_amount    NUMERIC(15, 0) NOT NULL,
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
    requested_amount    NUMERIC(15, 0) NOT NULL,
    funded_amount       NUMERIC(15, 0) NOT NULL DEFAULT 0,
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
    amount                  NUMERIC(15, 0) NOT NULL,
    funded_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT funding_amount_positive CHECK (amount > 0)
);

-- Repayment Installments
CREATE TABLE repayment_installments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_application_id     UUID NOT NULL REFERENCES loan_applications(id),
    installment_number      INTEGER NOT NULL,
    amount                  NUMERIC(15, 0) NOT NULL,
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
('Pompa Air Industri',
 'Pompa sentrifugal heavy-duty kapasitas 1.900 liter/menit. Cocok untuk proyek konstruksi dan irigasi berskala besar.',
 72000000, 15, 'machinery'),

('Motor Listrik 50HP',
 'Motor induksi tiga fase, 50 horsepower, 1800 RPM. Rated IP55 untuk penggunaan luar ruangan.',
 52000000, 8, 'machinery'),

('Hydraulic Press 20 Ton',
 'Hydraulic press rangka-H kapasitas 20 ton. Dilengkapi pressure gauge dan safety relief valve.',
 125000000, 5, 'machinery'),

('Kompresor Udara Industri',
 'Kompresor screw rotary, output 2.800 liter/menit, maksimum 10 bar. Cocok untuk penggunaan industri berkelanjutan.',
 88000000, 10, 'machinery'),

-- Raw Materials
('Besi Beton Bundel (1 Ton)',
 'Besi beton ulir diameter 12mm, bundel 1 ton. Grade BJTS 420.',
 20000000, 50, 'raw-materials'),

('Kabel Tembaga Rol 100m',
 'Kabel konduktor tembaga murni, penampang 10mm², insulasi PVC. Gulungan 100 meter.',
 14000000, 30, 'raw-materials'),

('Plat Aluminium 4x8ft',
 'Plat aluminium alloy seri 6061-T6, ukuran 4x8 kaki, ketebalan 3mm. Cocok untuk fabrikasi.',
 5200000, 100, 'raw-materials'),

('Bundel Pipa PVC (50 pcs)',
 'Pipa PVC Schedule 40, diameter 3 inci, panjang 3 meter. Bundel isi 50 batang.',
 7800000, 40, 'raw-materials'),

-- Office & Warehouse
('Rak Gudang Heavy-Duty',
 'Rak baja industri 5 tingkat, kapasitas total 900 kg. Ukuran 183x122x61 cm.',
 11000000, 25, 'office-warehouse'),

('Electric Pallet Jack',
 'Pallet jack elektrik ride-on, kapasitas 2.000 kg, baterai 48V. Sudah termasuk charger.',
 100000000, 6, 'office-warehouse'),

('Printer Laser Bisnis',
 'Printer laser monokrom kecepatan tinggi, 65 PPM, cetak bolak-balik, baki 550 lembar. Siap jaringan.',
 18000000, 20, 'office-warehouse'),

-- Safety & PPE
('Helm Keselamatan Bulk (50 pcs)',
 'Helm keras berventilasi tersertifikasi SNI. Paket isi 50 pcs dalam berbagai warna.',
 7000000, 60, 'safety-ppe');

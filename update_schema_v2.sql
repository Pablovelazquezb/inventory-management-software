-- update_schema_v2.sql

-- 1. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    rfc TEXT,
    address TEXT,
    legal_name TEXT, -- Razón Social
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Suppliers Table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS rfc TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. Update Sales Table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0, -- e.g. 0.16 for 16%
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_name TEXT DEFAULT 'IVA' CHECK (tax_name IN ('IVA', 'ISR', 'IEPS', 'RETENCION', 'OTRO', 'NINGUNO'));

-- Note: 'total_price' already exists, but we should clarify if it includes tax. 
-- In this logic: total_price = subtotal + tax_amount.
-- Existing rows might need backfilling if we care, but for now defaults follow existing logic (tax 0).

-- 4. Create Policies for Customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view/manage customers (assuming single tenant or shared for now, 
-- consistent with suppliers policy which might be missing but 'inventory_items' has it)
-- Actually, let's just make it public for auth users for simplicity as per previous pattern
CREATE POLICY "Enable all access for authenticated users" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

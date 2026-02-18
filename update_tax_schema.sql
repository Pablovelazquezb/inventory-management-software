-- update_tax_schema.sql

-- Add taxes column to sales table
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::JSONB;

-- Add taxes column to purchases table
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS taxes JSONB DEFAULT '[]'::JSONB;

-- Comment: The 'taxes' column will store an array of tax objects:
-- [{"name": "IVA", "rate": 0.16, "amount": 10.0}, {"name": "ISR", "rate": 0.10, "amount": 5.0}]
-- 'tax_amount' column (added previously) will represent the SUM of all amounts in this array.

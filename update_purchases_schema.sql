-- Add new columns to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Index for payment status might be useful for filtering later
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);

-- Fix purchases table schema - add missing columns safely

DO $$
BEGIN
    -- Add document_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'document_url') THEN
        ALTER TABLE purchases ADD COLUMN document_url TEXT;
    END IF;

    -- Add expected_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'expected_date') THEN
        ALTER TABLE purchases ADD COLUMN expected_date DATE;
    END IF;

    -- Add total_amount (with default 0)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'total_amount') THEN
        ALTER TABLE purchases ADD COLUMN total_amount NUMERIC DEFAULT 0;
    END IF;

    -- Add payment_status (New feature)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_status') THEN
        ALTER TABLE purchases ADD COLUMN payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending';
        CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
    END IF;

    -- Add tax_rate (New feature)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'tax_rate') THEN
        ALTER TABLE purchases ADD COLUMN tax_rate NUMERIC DEFAULT 0;
    END IF;

    -- Add notes (New feature)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'notes') THEN
        ALTER TABLE purchases ADD COLUMN notes TEXT;
    END IF;

     -- Add supplier_id (Just in case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'supplier_id') THEN
        ALTER TABLE purchases ADD COLUMN supplier_id UUID REFERENCES suppliers(id);
        CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
    END IF;

END $$;

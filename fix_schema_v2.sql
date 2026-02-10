-- Comprehensive Schema Fix V2
-- Fix potentially missing columns in 'purchases' AND 'purchase_items'

DO $$
BEGIN
    ---------- PURCHASES TABLE ----------
    -- Add document_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'document_url') THEN
        ALTER TABLE purchases ADD COLUMN document_url TEXT;
    END IF;

    -- Add expected_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'expected_date') THEN
        ALTER TABLE purchases ADD COLUMN expected_date DATE;
    END IF;

    -- Add total_amount
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'total_amount') THEN
        ALTER TABLE purchases ADD COLUMN total_amount NUMERIC DEFAULT 0;
    END IF;

    -- Add payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_status') THEN
        ALTER TABLE purchases ADD COLUMN payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending';
        CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
    END IF;

    -- Add tax_rate
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'tax_rate') THEN
        ALTER TABLE purchases ADD COLUMN tax_rate NUMERIC DEFAULT 0;
    END IF;

    -- Add notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'notes') THEN
        ALTER TABLE purchases ADD COLUMN notes TEXT;
    END IF;

    -- Add supplier_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'supplier_id') THEN
        ALTER TABLE purchases ADD COLUMN supplier_id UUID REFERENCES suppliers(id);
        CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
    END IF;


    ---------- PURCHASE_ITEMS TABLE ----------
    -- Check for columns that might be missing if the table was created partially or incorrectly
    
    -- quantity_ordered
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_ordered') THEN
        ALTER TABLE purchase_items ADD COLUMN quantity_ordered NUMERIC NOT NULL DEFAULT 0;
    END IF;

    -- quantity_received
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_received') THEN
        ALTER TABLE purchase_items ADD COLUMN quantity_received NUMERIC DEFAULT 0;
    END IF;

    -- cost_per_unit (The one currently failing)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'cost_per_unit') THEN
        ALTER TABLE purchase_items ADD COLUMN cost_per_unit NUMERIC DEFAULT 0;
    END IF;

    -- purchase_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'purchase_id') THEN
        ALTER TABLE purchase_items ADD COLUMN purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
    END IF;

    -- item_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'item_id') THEN
        ALTER TABLE purchase_items ADD COLUMN item_id UUID REFERENCES inventory_items(id);
        CREATE INDEX IF NOT EXISTS idx_purchase_items_item_id ON purchase_items(item_id);
    END IF;

END $$;

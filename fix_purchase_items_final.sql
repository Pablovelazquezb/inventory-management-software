-- Fix purchases table schema - remove NOT NULL constraints from legacy columns

DO $$
BEGIN
    -- 1. Relax NOT NULL on 'price_per_unit' (Legacy column causing issues)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'price_per_unit') THEN
        ALTER TABLE purchase_items ALTER COLUMN price_per_unit DROP NOT NULL;
    END IF;

    -- 2. Relax NOT NULL on 'quantity' (Legacy column causing issues - just in case it wasn't fixed before)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity') THEN
        ALTER TABLE purchase_items ALTER COLUMN quantity DROP NOT NULL;
    END IF;

    -- 3. Ensure my code's columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'cost_per_unit') THEN
         ALTER TABLE purchase_items ADD COLUMN cost_per_unit NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_ordered') THEN
         ALTER TABLE purchase_items ADD COLUMN quantity_ordered NUMERIC NOT NULL DEFAULT 1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_received') THEN
         ALTER TABLE purchase_items ADD COLUMN quantity_received NUMERIC DEFAULT 0;
    END IF;

END $$;

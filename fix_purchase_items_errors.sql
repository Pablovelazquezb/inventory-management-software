-- Fix purchase_items not-null constraint on 'quantity'

-- It seems the 'purchase_items' table has a 'quantity' column with a NOT NULL constraint,
-- but the code is designed to use 'quantity_ordered'. This script relaxes that constraint
-- and ensures 'quantity_ordered' is the primary column.

DO $$
BEGIN
    -- 1. If 'quantity' column exists (and is causing issues), remove the NOT NULL constraint
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity') THEN
        ALTER TABLE purchase_items ALTER COLUMN quantity DROP NOT NULL;
    END IF;

    -- 2. If 'quantity_ordered' is missing (for some reason), add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_ordered') THEN
        ALTER TABLE purchase_items ADD COLUMN quantity_ordered NUMERIC NOT NULL DEFAULT 1;
    END IF;

    -- 3. If 'cost_per_unit' is missing, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'cost_per_unit') THEN
        ALTER TABLE purchase_items ADD COLUMN cost_per_unit NUMERIC DEFAULT 0;
    END IF;

     -- 4. If 'quantity_received' is missing, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_received') THEN
        ALTER TABLE purchase_items ADD COLUMN quantity_received NUMERIC DEFAULT 0;
    END IF;

END $$;

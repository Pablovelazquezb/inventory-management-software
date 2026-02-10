-- "Nuclear" Fix for purchase_items - Relax ALL potential legacy constraints

DO $$
BEGIN
    ---------- LEAGACY COLUMNS: RELAX NOT NULL -----------
    
    -- 1. unit_type (Latest error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'unit_type') THEN
        ALTER TABLE purchase_items ALTER COLUMN unit_type DROP NOT NULL;
    END IF;

    -- 2. price_per_unit (Previous error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'price_per_unit') THEN
        ALTER TABLE purchase_items ALTER COLUMN price_per_unit DROP NOT NULL;
    END IF;

    -- 3. quantity (Previous error)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity') THEN
        ALTER TABLE purchase_items ALTER COLUMN quantity DROP NOT NULL;
    END IF;

    -- 4. status (Maybe?)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'status') THEN
        ALTER TABLE purchase_items ALTER COLUMN status DROP NOT NULL;
    END IF;

     -- 5. total_price (Maybe?)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'total_price') THEN
        ALTER TABLE purchase_items ALTER COLUMN total_price DROP NOT NULL;
    END IF;


    ---------- MY COLUMNS: ENSURE EXISTENCE -----------
    
    -- Ensure cost_per_unit exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'cost_per_unit') THEN
         ALTER TABLE purchase_items ADD COLUMN cost_per_unit NUMERIC DEFAULT 0;
    END IF;

    -- Ensure quantity_ordered exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_ordered') THEN
         ALTER TABLE purchase_items ADD COLUMN quantity_ordered NUMERIC NOT NULL DEFAULT 1;
    END IF;

    -- Ensure quantity_received exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchase_items' AND column_name = 'quantity_received') THEN
         ALTER TABLE purchase_items ADD COLUMN quantity_received NUMERIC DEFAULT 0;
    END IF;

END $$;

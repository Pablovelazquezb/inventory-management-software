-- INVENTORY MANAGEMENT SYSTEM COMPLETE SCHEMA
-- Consolidated user's original schema with new features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUPPLIERS
-- (New Feature for structured supplier management)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INVENTORY ITEMS
-- (Base table)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    subcategory_id UUID,
    quantity NUMERIC DEFAULT 0,
    weight NUMERIC,
    price NUMERIC DEFAULT 0,
    unit_type TEXT DEFAULT 'unit', -- Matched user's default 'unit'
    sku TEXT,
    description TEXT,
    image_url TEXT,
    user_id UUID REFERENCES auth.users(id), -- From user's snippet implicitly? Added just in case
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);

-- 3. SALES
-- (From User's Snippet)
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL, -- User had INTEGER, keeping it
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  unit_type TEXT DEFAULT 'unit', -- User added this
  invoice_url TEXT, -- User added this
  note TEXT, -- User added this
  sold_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Policies for Sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can manage their own sales" ON sales
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 4. STOCK ENTRIES
-- (From User's Snippet + Improvements)
CREATE TABLE IF NOT EXISTS stock_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_added INTEGER NOT NULL,
  note TEXT,
  added_at TIMESTAMPTZ DEFAULT now(), -- User calls it added_at
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Policies for Stock Entries
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Users can manage their own entries" ON stock_entries
        USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 5. PURCHASES
-- (Merged: Use Supplier ID for relations, but keep notes/status. User's script had supplier_name, we use supplier_id relation)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL, -- Better practice than supplier_name
    supplier_name TEXT, -- Keeping for legacy or manual entry if needed
    status TEXT CHECK (status IN ('ordered', 'received', 'cancelled', 'pending')) DEFAULT 'ordered',
    total_amount NUMERIC DEFAULT 0,
    expected_date DATE,
    document_url TEXT, -- or invoice_url
    invoice_url TEXT, -- User called it invoice_url, keeping both or aliasing effectively
    payment_status TEXT CHECK (payment_status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
    tax_rate NUMERIC DEFAULT 0,
    note TEXT, -- User called it note
    notes TEXT, -- I called it notes previously. Let's keep both or standardise. Code seems to use 'notes'.
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);

-- 6. PURCHASE ITEMS
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    
    quantity NUMERIC, -- Legacy
    quantity_ordered NUMERIC NOT NULL DEFAULT 1,
    quantity_received NUMERIC DEFAULT 0,
    
    cost_per_unit NUMERIC DEFAULT 0,
    price_per_unit NUMERIC, -- Legacy alias
    
    unit_type TEXT DEFAULT 'unit',
    total_price NUMERIC GENERATED ALWAYS AS (quantity_ordered * cost_per_unit) STORED, -- Computed column
    
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_item_id ON purchase_items(item_id);


-- 7. SUPPLIER CATALOG (Smart Catalog)
CREATE TABLE IF NOT EXISTS supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    supplier_sku TEXT,
    cost NUMERIC,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier_id ON supplier_products(supplier_id);

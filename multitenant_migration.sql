-- ============================================================
-- MULTI-TENANT MIGRATION
-- Run ONCE in Supabase SQL Editor
-- ============================================================

-- -------------------------------------------------------
-- 1. ORGANIZATIONS table
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  logo_url   TEXT,
  plan       TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------
-- 2. ORGANIZATION MEMBERS  (user ↔ org junction table)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL DEFAULT 'member'
                  CHECK (role IN ('owner', 'admin', 'member')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org  ON organization_members(organization_id);

-- -------------------------------------------------------
-- 3. Add organization_id column to every business table
-- -------------------------------------------------------
ALTER TABLE inventory_items   ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE sales              ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE stock_entries      ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE purchases          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE purchase_items     ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE suppliers          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE supplier_products  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE customers          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- categories / subcategories (created by the app, may or may not exist)
ALTER TABLE categories    ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_org    ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_org              ON sales(organization_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_org      ON stock_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_purchases_org          ON purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org          ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_org          ON customers(organization_id);

-- -------------------------------------------------------
-- 4. Helper function: is current user a member of an org?
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION is_member_of(org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------
-- 5. RLS – organizations
-- -------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Members can view their orgs" ON organizations
    FOR SELECT USING (is_member_of(id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners/admins can update their org" ON organizations
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- -------------------------------------------------------
-- 6. RLS – organization_members
-- -------------------------------------------------------
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Members can view memberships in their orgs" ON organization_members
    FOR SELECT USING (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Owners/admins can manage members" ON organization_members
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM organization_members m2
        WHERE m2.organization_id = organization_members.organization_id
          AND m2.user_id = auth.uid()
          AND m2.role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- -------------------------------------------------------
-- 7. RLS – business tables (replace user-scoped policies)
-- -------------------------------------------------------

-- inventory_items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own items" ON inventory_items;
  CREATE POLICY "Org members can manage items" ON inventory_items
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own sales" ON sales;
  CREATE POLICY "Org members can manage sales" ON sales
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- stock_entries
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own entries" ON stock_entries;
  CREATE POLICY "Org members can manage stock entries" ON stock_entries
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- purchases
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Org members can manage purchases" ON purchases
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- purchase_items
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Org members can manage purchase items" ON purchase_items
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Org members can manage suppliers" ON suppliers
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- supplier_products
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Org members can manage supplier products" ON supplier_products
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  DROP POLICY IF EXISTS "Enable all access for authenticated users" ON customers;
  CREATE POLICY "Org members can manage customers" ON customers
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- categories (if exists)
DO $$ BEGIN
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Org members can manage categories" ON categories
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- subcategories (if exists)
DO $$ BEGIN
  ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Org members can manage subcategories" ON subcategories
    FOR ALL USING (is_member_of(organization_id))
    WITH CHECK (is_member_of(organization_id));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- -------------------------------------------------------
-- 8. DATA MIGRATION
-- Creates one default org per existing auth user and assigns
-- all rows that currently have user_id = <user> to that org.
-- -------------------------------------------------------

-- 8a. Create one org per existing user
INSERT INTO organizations (id, name, slug)
SELECT
  gen_random_uuid(),
  'Empresa de ' || COALESCE(u.email, u.id::text),
  'org-' || replace(u.id::text, '-', '')
FROM auth.users u
ON CONFLICT (slug) DO NOTHING;

-- 8b. Link each user to their personal org as owner
-- (Assumes slug = 'org-' || replace(user_id, '-', ''))
INSERT INTO organization_members (organization_id, user_id, role)
SELECT o.id, u.id, 'owner'
FROM auth.users u
JOIN organizations o ON o.slug = 'org-' || replace(u.id::text, '-', '')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 8c. Assign all existing business rows to their owner's org
UPDATE inventory_items i
SET organization_id = o.id
FROM organizations o
WHERE o.slug = 'org-' || replace(i.user_id::text, '-', '')
  AND i.organization_id IS NULL;

UPDATE sales s
SET organization_id = o.id
FROM organizations o
WHERE o.slug = 'org-' || replace(s.user_id::text, '-', '')
  AND s.organization_id IS NULL;

UPDATE stock_entries se
SET organization_id = o.id
FROM organizations o
WHERE o.slug = 'org-' || replace(se.user_id::text, '-', '')
  AND se.organization_id IS NULL;

UPDATE purchases p
SET organization_id = o.id
FROM organizations o
WHERE o.slug = 'org-' || replace(p.user_id::text, '-', '')
  AND p.organization_id IS NULL;

-- purchase_items, suppliers, supplier_products don't have user_id directly,
-- link via their parent:
UPDATE purchase_items pi
SET organization_id = p.organization_id
FROM purchases p
WHERE pi.purchase_id = p.id
  AND pi.organization_id IS NULL;

UPDATE supplier_products sp
SET organization_id = s.organization_id
FROM suppliers s
WHERE sp.supplier_id = s.id
  AND sp.organization_id IS NULL;

-- customers — no user_id, assign to first available org as fallback
-- (improve this manually if you have multiple users)
UPDATE customers
SET organization_id = (SELECT id FROM organizations LIMIT 1)
WHERE organization_id IS NULL;

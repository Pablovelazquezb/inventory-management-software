-- ============================================================
-- SUPER ADMIN MIGRATION
-- Run ONCE in Supabase SQL Editor AFTER multitenant_migration.sql
-- ============================================================

-- 1. super_admins table (platform-level role, not tied to any org)
CREATE TABLE IF NOT EXISTS super_admins (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: only super admins can see this table
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Super admins can see the table" ON super_admins
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Helper function: is the current user a super admin?
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid());
$$;

-- 3. Allow super admins to bypass org-level RLS on core tables
--    (They can read everything across all orgs)

-- organizations
DO $$ BEGIN
  CREATE POLICY "Super admins see all orgs" ON organizations
    FOR SELECT USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins manage all orgs" ON organizations
    FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- organization_members
DO $$ BEGIN
  CREATE POLICY "Super admins see all members" ON organization_members
    FOR SELECT USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins manage all members" ON organization_members
    FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- inventory_items
DO $$ BEGIN
  CREATE POLICY "Super admins see all items" ON inventory_items
    FOR SELECT USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- sales
DO $$ BEGIN
  CREATE POLICY "Super admins see all sales" ON sales
    FOR SELECT USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 4. profiles table (needed for invite-by-email feature)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  full_name  TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins see all profiles" ON profiles
    FOR SELECT USING (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Super admins manage all profiles" ON profiles
    FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Trigger: auto-create profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill existing users into profiles
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. SEED YOUR FIRST SUPER ADMIN
--    Replace with your actual user UUID from Supabase > Auth > Users
-- ============================================================
-- INSERT INTO super_admins (user_id) VALUES ('YOUR-USER-UUID-HERE');

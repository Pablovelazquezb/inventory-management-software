-- ============================================================
-- RLS FIX: Missing INSERT policies
-- Run this in Supabase SQL Editor if you get the error:
-- "new row violates row-level security policy for table ..."
-- ============================================================

-- Organizations: any authenticated user can create one
DO $$ BEGIN
  CREATE POLICY "Authenticated users can create orgs" ON organizations
    FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Organization members: members can insert themselves (for onboarding)
DO $$ BEGIN
  CREATE POLICY "Users can join orgs" ON organization_members
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Organization members: owners/admins can add others
DO $$ BEGIN
  CREATE POLICY "Admins can add members" ON organization_members
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = organization_members.organization_id
          AND user_id = auth.uid()
          AND role IN ('owner', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

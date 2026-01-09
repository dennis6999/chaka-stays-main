-- CLEAN SLATE RESTORE
-- This script WIPES OUT all existing policies to ensure no "collisions" exist.
-- Then it installs the basic, working security model.

DO $$
DECLARE
    pol record;
BEGIN
    -- 1. DROP ALL POLICIES on our tables
    FOR pol IN SELECT schemaname, policyname, tablename 
               FROM pg_policies 
               WHERE tablename IN ('properties', 'bookings', 'profiles', 'reviews', 'favorites') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- 2. DISABLE RLS TEMPORARILY (To ensure admin scripts can run init if needed)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 3. ENSURE SCHEMA (Is Admin)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 4. GRANT BASE PERMISSIONS (The most common failure point)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 5. RE-ENABLE RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. INSTALL SIMPLE, NON-CONFLICTING POLICIES

-- PROPERTIES
CREATE POLICY "policy_properties_select_public" ON properties FOR SELECT USING (true);
CREATE POLICY "policy_properties_insert_host" ON properties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "policy_properties_update_host" ON properties FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "policy_properties_delete_host" ON properties FOR DELETE USING (auth.uid() = host_id);
CREATE POLICY "policy_properties_delete_admin" ON properties FOR DELETE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- PROFILES
CREATE POLICY "policy_profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "policy_profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- BOOKINGS
CREATE POLICY "policy_bookings_select_own" ON bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "policy_bookings_insert_own" ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
CREATE POLICY "policy_bookings_select_host" ON bookings FOR SELECT USING (
    auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id)
);
CREATE POLICY "policy_bookings_select_admin" ON bookings FOR SELECT USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- REVIEWS
CREATE POLICY "policy_reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "policy_reviews_insert_own" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. NOTIFY REFRESH
NOTIFY pgrst, 'reload config';

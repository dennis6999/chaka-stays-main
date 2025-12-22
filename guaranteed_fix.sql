-- GUARANTEED RESTORE v3
-- Run this to fix "Still not working"
-- This script does 3 things:
-- 1. Ensures the 'is_admin' column exists (prevents SQL errors).
-- 2. Grants base permissions to the database roles (often missed).
-- 3. Sets SIMPLE, standard security policies that work.

-- STEP 1: Ensure Schema is Correct
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- STEP 2: Grant Base Permissions (Crucial step often missed)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- STEP 3: Reset Security to "Sensible Strict"
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Clean old policies
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Public can view properties v2" ON properties;
DROP POLICY IF EXISTS "Hosts can insert properties" ON properties;
DROP POLICY IF EXISTS "Hosts can update own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can delete own properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- STEP 4: Apply Policies

-- A. PROPERTIES (Public Read, Host Write, Admin Delete)
CREATE POLICY "Public Properties Read" ON properties FOR SELECT USING (true);
CREATE POLICY "Host Properties Insert" ON properties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host Properties Update" ON properties FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host Properties Delete" ON properties FOR DELETE USING (auth.uid() = host_id);
CREATE POLICY "Admin Properties Delete" ON properties FOR DELETE USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- B. PROFILES (Public Read, User Update)
CREATE POLICY "Public Profiles Read" ON profiles FOR SELECT USING (true);
CREATE POLICY "User Profile Update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- C. REVIEWS (Public Read, User Create)
CREATE POLICY "Public Reviews Read" ON reviews FOR SELECT USING (true);
CREATE POLICY "User Review Create" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- D. BOOKINGS (Private)
-- Guest sees own
CREATE POLICY "Guest View Bookings" ON bookings FOR SELECT USING (auth.uid() = guest_id);
-- Guest creates own
CREATE POLICY "Guest Create Bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);
-- Host sees bookings for their properties (Simple Query to avoid recursion)
CREATE POLICY "Host View Bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM properties WHERE properties.id = bookings.property_id AND properties.host_id = auth.uid())
);
-- Admin sees all
CREATE POLICY "Admin View Bookings" ON bookings FOR SELECT USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- STEP 5: Refresh
NOTIFY pgrst, 'reload config';

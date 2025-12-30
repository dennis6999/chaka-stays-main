-- RESTORE STRICT SECURITY (The "Right Way")
-- Run this to re-enable security while keeping the site working.

-- 1. Re-enable RLS (Turn the security cameras back on)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. PROPERTIES POLICIES
-- Clean slate
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Hosts can insert properties" ON properties;
DROP POLICY IF EXISTS "Hosts can update own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can delete own properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete any property_v2" ON properties;

-- Public Read (Crucial for details page)
CREATE POLICY "Public can view properties"
ON properties FOR SELECT
USING (true);

-- Hosts Create
CREATE POLICY "Hosts can insert properties"
ON properties FOR INSERT
WITH CHECK (auth.uid() = host_id);

-- Hosts Update Own
CREATE POLICY "Hosts can update own properties"
ON properties FOR UPDATE
USING (auth.uid() = host_id);

-- Hosts Delete Own
CREATE POLICY "Hosts can delete own properties"
ON properties FOR DELETE
USING (auth.uid() = host_id);

-- Admins Delete Any (Moderation)
CREATE POLICY "Admins can delete any property"
ON properties FOR DELETE
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );


-- 3. BOOKINGS POLICIES
-- Clean slate
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings_v2" ON bookings;

-- Guest View Own
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = guest_id);

-- Host View Their Property Bookings
CREATE POLICY "Hosts can view bookings for their properties"
ON bookings FOR SELECT
USING (
  auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id)
);

-- Guest Create
CREATE POLICY "Users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = guest_id);

-- Admin View All
CREATE POLICY "Admins can view all bookings" 
ON bookings FOR SELECT 
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );


-- 4. PROFILES POLICIES
-- Clean slate
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles_v2" ON profiles;

-- Public Read (Needed for 'Hosted by X')
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- User Update Own
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admin View All (Redundant with public read, but good for explicit admin tools if we hide emails later)
CREATE POLICY "Admins can view all profiles_admin" 
ON profiles FOR SELECT 
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );

-- 5. Force Refresh Schema
NOTIFY pgrst, 'reload config';

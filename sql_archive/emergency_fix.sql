-- EMERGENCY FIX: RESTORE PUBLIC ACCESS
-- Run this immediately to fix "Failed to load property details"

-- 1. Unconditionally enable public read for properties
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Allow public read access" ON properties;
DROP POLICY IF EXISTS "Anyone can view properties" ON properties;

CREATE POLICY "Public can view properties"
ON properties FOR SELECT
USING (true);

-- 2. Ensure Bookings are viewable by their owners (Fix Dashboard)
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = guest_id);

DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
CREATE POLICY "Hosts can view bookings for their properties"
ON bookings FOR SELECT
USING (
  auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id)
);

-- 3. Verify Profiles are readable (needed for "Hosted by...")
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- MASTER PERMISSION FIX SCRIPT
-- Run this entire script to fix "Property Not Found" and "Dashboard Fetch Failed" errors.

-- 1. PUBLIC PROFILES: Allow everyone to see Host Names & Avatars
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- 2. PUBLIC PROPERTIES: Allow everyone to see Property Listings
DROP POLICY IF EXISTS "Public properties are viewable by everyone" ON properties;
CREATE POLICY "Public properties are viewable by everyone" 
ON properties FOR SELECT 
USING (true);

-- 3. GUESTS: Allow users to see their own bookings
DROP POLICY IF EXISTS "Guests can view own bookings" ON bookings;
CREATE POLICY "Guests can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = guest_id);

-- 4. HOSTS: Allow hosts to see bookings for their properties
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
CREATE POLICY "Hosts can view bookings for their properties"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = bookings.property_id
    AND properties.host_id = auth.uid()
  )
);

-- 5. BOOKING CREATION: Allow users to create bookings
DROP POLICY IF EXISTS "Guests can create bookings" ON bookings;
CREATE POLICY "Guests can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = guest_id);

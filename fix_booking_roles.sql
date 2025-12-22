-- Enable RLS on bookings (good practice to ensure it's on)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 1. Tenants (Guests) can view their own bookings
DROP POLICY IF EXISTS "Guests can view own bookings" ON bookings;
CREATE POLICY "Guests can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = guest_id);

-- 2. Hosts can view bookings for their own properties
-- This checks if the booking is for a property owned by the current user
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

-- 3. Guests can create bookings
DROP POLICY IF EXISTS "Guests can create bookings" ON bookings;
CREATE POLICY "Guests can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = guest_id);

-- 4. Guests/Hosts can update bookings (e.g. for cancellation)
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (
  auth.uid() = guest_id OR 
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = bookings.property_id
    AND properties.host_id = auth.uid()
  )
);

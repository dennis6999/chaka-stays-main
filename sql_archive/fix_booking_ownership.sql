-- FIX BOOKING CANCELLATION PERMISSIONS

BEGIN;

-- 1. Drop restrictve policies on bookings
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Guests can update own bookings" ON bookings;

-- 2. Create Policy: Users can update their OWN bookings (e.g. to set status = 'cancelled')
CREATE POLICY "Users update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = guest_id);

-- 3. Also ensure Hosts can update bookings for their properties (if you want hosts to cancel/confirm too)
CREATE POLICY "Hosts update received bookings"
ON bookings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = bookings.property_id
    AND properties.host_id = auth.uid()
  )
);

COMMIT;
NOTIFY pgrst, 'reload config';

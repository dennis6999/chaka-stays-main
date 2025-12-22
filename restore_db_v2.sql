-- ==========================================
-- CHAKA STAYS - SITE REPAIR SCRIPT (NO ADMIN)
-- Run this in Supabase SQL Editor to fix Bookings & Search
-- ==========================================

-- 1. CLEANUP (Remove Admin features if present)
-- Must drop dependent policies FIRST
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;

-- Now safe to remove column
ALTER TABLE profiles DROP COLUMN IF EXISTS is_admin CASCADE;

-- 2. FIX BOOKING CONSTRAINTS (Prevent delete errors)
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_property_id_fkey,
ADD CONSTRAINT bookings_property_id_fkey
    FOREIGN KEY (property_id)
    REFERENCES public.properties(id)
    ON DELETE CASCADE;

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. PROPERTY POLICIES
-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow hosts to manage their own properties" ON public.properties;
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "properties_select_policy" ON public.properties;
DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
DROP POLICY IF EXISTS "Hosts can manage their own properties" ON public.properties;

-- Re-create
CREATE POLICY "Public can view properties"
ON public.properties FOR SELECT
USING (true);

CREATE POLICY "Hosts can manage their own properties"
ON public.properties FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- 5. BOOKING POLICIES (Fixes "Missing Permissions")
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Guests can cancel own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Hosts can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Guests can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Guests can create bookings" ON public.bookings;

-- Guest View
CREATE POLICY "Guests can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = guest_id);

-- Host View
CREATE POLICY "Hosts can view bookings for their properties"
ON bookings FOR SELECT
USING (
  auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id)
);

-- Guest Create
CREATE POLICY "Guests can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = guest_id);

-- Guest Cancel (Update)
CREATE POLICY "Guests can cancel own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = guest_id);

-- Host Update (Confirm/Cancel)
CREATE POLICY "Hosts can update bookings"
ON bookings FOR UPDATE
USING (
  auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id)
);

-- 6. ESSENTIAL FUNCTIONS
-- Availability Check (Required by Search)
CREATE OR REPLACE FUNCTION check_availability(
  property_id uuid,
  check_in_date timestamp with time zone,
  check_out_date timestamp with time zone
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM bookings
    WHERE bookings.property_id = check_availability.property_id
      AND bookings.status != 'cancelled'
      AND (bookings.check_in, bookings.check_out) OVERLAPS (check_in_date, check_out_date)
  );
END;
$$;

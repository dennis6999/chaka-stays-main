-- FINAL SECURE FIX
-- Uses SECURITY DEFINER functions to prevent RLS recursion/locking issues.

-- 1. Helper Function: Check if user is Admin (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- 2. Helper Function: Check if user owns the property (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_property_owner(property_id uuid)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_id
    AND host_id = auth.uid()
  );
$$;

-- 3. Reset RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY; -- Forgot this one before!

-- 4. Clean Policies
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Hosts can insert properties" ON properties;
DROP POLICY IF EXISTS "Hosts can update own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can delete own properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete any property" ON properties;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;

-- 5. Properties Policies
CREATE POLICY "Public can view properties" 
ON properties FOR SELECT USING (true);

CREATE POLICY "Hosts can insert properties" 
ON properties FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update own properties" 
ON properties FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete own properties" 
ON properties FOR DELETE USING (auth.uid() = host_id);

CREATE POLICY "Admins can delete any property" 
ON properties FOR DELETE USING (public.is_admin());

-- 6. Bookings Policies
CREATE POLICY "Users can view their own bookings" 
ON bookings FOR SELECT USING (auth.uid() = guest_id);

-- Uses the security definer function to strictly check ownership without RLS blocking
CREATE POLICY "Hosts can view bookings for their properties" 
ON bookings FOR SELECT USING (public.is_property_owner(property_id));

CREATE POLICY "Users can create bookings" 
ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Admins can view all bookings" 
ON bookings FOR SELECT USING (public.is_admin());

-- 7. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- 8. Reviews Policies
CREATE POLICY "Public can view reviews" 
ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" 
ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

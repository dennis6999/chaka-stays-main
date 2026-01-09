-- SAFE ADMIN INIT SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Add is_admin column (Safe: only adds if missing)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Grant Admin Permissions (Additive Only)
-- View All Profiles
CREATE POLICY "Admins can view all profiles_v2" 
ON profiles FOR SELECT 
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );

-- View All Bookings
CREATE POLICY "Admins can view all bookings_v2" 
ON bookings FOR SELECT 
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );

-- Moderate Properties (Delete)
CREATE POLICY "Admins can delete any property_v2" 
ON properties FOR DELETE 
USING ( (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE );

-- 3. Stats Helper Function (Optional but safe)
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users int;
  total_properties int;
  total_bookings int;
  total_revenue numeric;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Access Denied';
  END IF;

  SELECT count(*) INTO total_users FROM profiles;
  SELECT count(*) INTO total_properties FROM properties;
  SELECT count(*) INTO total_bookings FROM bookings;
  SELECT COALESCE(sum(total_price), 0) INTO total_revenue FROM bookings WHERE status = 'confirmed';

  RETURN json_build_object(
    'users', total_users,
    'properties', total_properties,
    'bookings', total_bookings,
    'revenue', total_revenue
  );
END;
$$;

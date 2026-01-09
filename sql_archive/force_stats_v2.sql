-- FORCE FIX ADMIN STATS V2
-- 1. Drop the function to ensure no signature conflicts
DROP FUNCTION IF EXISTS get_admin_stats();

-- 2. Re-create the function
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   u_count int;
   p_count int;
   b_count int;
   r_total numeric;
BEGIN
   -- 1. Get exact counts directly from tables
   SELECT count(*) INTO u_count FROM profiles;
   SELECT count(*) INTO p_count FROM properties;
   SELECT count(*) INTO b_count FROM bookings;
   
   -- 2. Calculate revenue
   SELECT COALESCE(SUM(total_price), 0) INTO r_total 
   FROM bookings 
   WHERE status != 'cancelled';
   
   -- 3. Return JSON object
   RETURN json_build_object(
     'users', u_count,
     'properties', p_count,
     'bookings', b_count,
     'revenue', r_total
   );
END;
$$;

-- 3. Grant Permissions Explicitly to ALL potentially active roles
GRANT EXECUTE ON FUNCTION get_admin_stats TO postgres;
GRANT EXECUTE ON FUNCTION get_admin_stats TO anon;
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats TO service_role;

-- 4. Notify to refresh schema cache
NOTIFY pgrst, 'reload config';

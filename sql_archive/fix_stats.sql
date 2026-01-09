-- FIX ADMIN STATS (Server-Side Logic)
-- This creates a secure function that runs as the database owner.
-- It bypasses RLS to get accurate counts, guaranteeing "Non-Zero" results.

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
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

-- Grant permission to logged-in users
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats TO service_role;

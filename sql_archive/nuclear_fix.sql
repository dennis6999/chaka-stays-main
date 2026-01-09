-- NUCLEAR OPTION: DISABLE RLS TEMPORARILY
-- This verifies if permissions are the cause.

-- 1. Disable RLS completely on core tables
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Explicitly grant permissions to anon/authenticated roles
GRANT ALL ON properties TO anon, authenticated, service_role;
GRANT ALL ON bookings TO anon, authenticated, service_role;
GRANT ALL ON profiles TO anon, authenticated, service_role;

-- 3. Reload schema cache (notify PostgREST)
NOTIFY pgrst, 'reload config';

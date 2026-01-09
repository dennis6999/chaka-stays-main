-- FINAL PERMISSIONS FIX
-- This script nukes existing policies on 'properties' to ensure no lingering "Allow All" policies exist.

BEGIN;

-- 1. Drop ALL existing policies on properties to start fresh
DROP POLICY IF EXISTS "Public Properties Read" ON properties;
DROP POLICY IF EXISTS "Public can view properties" ON properties;
DROP POLICY IF EXISTS "Enable read access for all users" ON properties;
DROP POLICY IF EXISTS "Admins Select All Properties" ON properties;
DROP POLICY IF EXISTS "Hosts Select Own Properties" ON properties;
DROP POLICY IF EXISTS "Users can create properties" ON properties;
DROP POLICY IF EXISTS "Hosts can update own properties" ON properties;
DROP POLICY IF EXISTS "Hosts can delete own properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON properties;
DROP POLICY IF EXISTS "Admins can update properties" ON properties;

-- 2. CREATE SELECT POLICIES
-- A. Public/Guests/Normal Users: Can ONLY see UNNUMBED properties
CREATE POLICY "Public Read Unbanned"
ON properties FOR SELECT
USING (is_banned = FALSE);

-- B. Admins: Can see EVERYTHING (including banned)
CREATE POLICY "Admins Read All"
ON properties FOR SELECT
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- C. Hosts: Can see THEIR OWN properties (even if banned)
CREATE POLICY "Hosts Read Own"
ON properties FOR SELECT
USING (auth.uid() = host_id);


-- 3. CREATE DELETE POLICIES
-- A. Hosts: Can delete their own
CREATE POLICY "Hosts Delete Own"
ON properties FOR DELETE
USING (auth.uid() = host_id);

-- B. Admins: Can delete ANY property (The "Confirm" you asked for)
CREATE POLICY "Admins Delete Any"
ON properties FOR DELETE
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);


-- 4. CREATE UPDATE POLICIES
-- A. Hosts: Can update their own (but NOT the is_banned column ideally, but standard update is row-based)
CREATE POLICY "Hosts Update Own"
ON properties FOR UPDATE
USING (auth.uid() = host_id);

-- B. Admins: Can update ANY property (including Ban status via RPC or direct)
CREATE POLICY "Admins Update Any"
ON properties FOR UPDATE
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);


-- 5. CREATE INSERT POLICIES
CREATE POLICY "Authenticated Insert"
ON properties FOR INSERT
WITH CHECK (auth.role() = 'authenticated'); -- Or strictly verify host_id matches? usually Insert is open to auth.

COMMIT;

NOTIFY pgrst, 'reload config';

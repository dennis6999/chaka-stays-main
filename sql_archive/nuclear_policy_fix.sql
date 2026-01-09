-- NUCLEAR RLS RESET
-- This script uses a loop to find AND DESTROY every single policy on the 'properties' table.
-- This ensures no hidden "Allow All" policies remain to override your Ban rules.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'properties'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON properties';
    END LOOP;
END $$;

-- NOW WE ARE CLEAN. APPLY STRICT RULES:

-- 1. Enable RLS (just in case)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 2. PUBLIC/GUESTS: Can ONLY see UN-BANNED properties
CREATE POLICY "Public Read Unbanned"
ON properties FOR SELECT
USING (is_banned = FALSE);

-- 3. ADMINS: Can see EVERYTHING and EDIT EVERYTHING
CREATE POLICY "Admins Full Access"
ON properties FOR ALL
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- 4. HOSTS: Can See and Edit THEIR OWN properties
CREATE POLICY "Hosts Full Access Own"
ON properties FOR ALL
USING (auth.uid() = host_id);


-- verify
COMMIT;

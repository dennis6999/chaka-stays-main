-- ADMIN ENHANCEMENTS: Ban Functionality & Better RLS

-- 1. Add 'is_banned' column to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- 2. Update Public Read Policy (Hide banned properties)
-- First, drop the old simplistic one
DROP POLICY IF EXISTS "Public Properties Read" ON properties;
DROP POLICY IF EXISTS "Public can view properties" ON properties;

-- Create one that filters out banned items
CREATE POLICY "Public Properties Read" 
ON properties FOR SELECT 
USING (is_banned = FALSE);

-- 3. Update Admin Policy (Admins can see EVERYTHING)
-- We need a specific policy for Admins to override the public one?
-- Actually, RLS policies are OR-ed together.
-- So checking "is_banned = FALSE" allows public access.
-- We need a separate policy: "Admins Select All"
CREATE POLICY "Admins Select All Properties" 
ON properties FOR SELECT 
USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);

-- 4. Hosts Select Own (Overrides is_banned so they can see their banned status)
CREATE POLICY "Hosts Select Own Properties" 
ON properties FOR SELECT 
USING (auth.uid() = host_id);


-- 5. Helper Functions for Ban/Unban (Secure RPC)
-- This avoids the frontend needing direct update permissions on that column
CREATE OR REPLACE FUNCTION toggle_ban_property(p_id uuid, ban_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow if caller is admin
  IF (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN
    UPDATE properties SET is_banned = ban_status WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Access Denied: You are not an admin.';
  END IF;
END;
$$;

-- Grant permissions for RPC
GRANT EXECUTE ON FUNCTION toggle_ban_property TO authenticated;

-- Refresh schema
NOTIFY pgrst, 'reload config';

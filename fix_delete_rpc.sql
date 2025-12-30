-- Secure Delete Function
-- Guarantees Admins can delete ANY property, even if RLS tries to hide it.

CREATE OR REPLACE FUNCTION delete_property_secure(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Security Check: Must be Admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE) THEN
        RAISE EXCEPTION 'Access Denied: Only Admins can delete properties.';
    END IF;

    -- 2. Perform Delete
    DELETE FROM properties
    WHERE id = p_id;

    -- 3. Check if it actually deleted something
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Property not found or already deleted.';
    END IF;
END;
$$;

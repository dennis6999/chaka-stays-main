-- 1. Ensure Bookings cascade on delete
-- This prevents "foreign key violation" errors when deleting a property that has bookings
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS bookings_property_id_fkey,
ADD CONSTRAINT bookings_property_id_fkey
    FOREIGN KEY (property_id)
    REFERENCES public.properties(id)
    ON DELETE CASCADE;

-- 2. Drop existing policy to ensure clean slate
DROP POLICY IF EXISTS "Allow hosts to manage their own properties" ON public.properties;

-- 3. Re-create policy with full permissions (SELECT, INSERT, UPDATE, DELETE) for the owner
CREATE POLICY "Allow hosts to manage their own properties"
ON public.properties
FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

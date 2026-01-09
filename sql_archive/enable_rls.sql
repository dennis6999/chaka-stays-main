-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access to properties
CREATE POLICY "Allow public read access"
ON public.properties
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert/update their own properties
CREATE POLICY "Allow hosts to manage their own properties"
ON public.properties
FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

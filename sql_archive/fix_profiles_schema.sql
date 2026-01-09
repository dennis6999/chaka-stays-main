-- FIX PROFILES SCHEMA
-- The error "column profiles.created_at does not exist" is crashing the admin panel.
-- This script adds the missing column.

-- 1. Add created_at column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Grant permissions just in case
GRANT ALL ON profiles TO postgres, anon, authenticated, service_role;

-- 3. Refresh schema
NOTIFY pgrst, 'reload config';

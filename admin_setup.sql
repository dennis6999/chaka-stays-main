-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create policy for Admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Create policy for Admins to view all bookings
CREATE POLICY "Admins can view all bookings" 
ON bookings FOR SELECT 
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- Create policy for Admins to delete any properties (Moderation)
CREATE POLICY "Admins can delete any property" 
ON properties FOR DELETE 
USING (
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- RUN THIS COMMAND (Replace with your actual email):
UPDATE profiles 
SET is_admin = TRUE 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@EXAMPLE.COM'
);

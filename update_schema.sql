-- Add property_type column to properties table if it doesn't exist
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_type text DEFAULT 'Home';

-- Update existing properties with mock types based on their titles or randomly
UPDATE public.properties SET property_type = 'Apartment' WHERE title ILIKE '%Apartment%' OR title ILIKE '%Suite%';
UPDATE public.properties SET property_type = 'Cottage' WHERE title ILIKE '%Cottage%';
UPDATE public.properties SET property_type = 'Room' WHERE title ILIKE '%Room%' OR title ILIKE '%Guest%';
UPDATE public.properties SET property_type = 'Home' WHERE property_type IS NULL OR (title NOT ILIKE '%Apartment%' AND title NOT ILIKE '%Suite%' AND title NOT ILIKE '%Cottage%' AND title NOT ILIKE '%Room%' AND title NOT ILIKE '%Guest%');

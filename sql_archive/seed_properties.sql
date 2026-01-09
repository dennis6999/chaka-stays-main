-- Insert mock properties into the 'properties' table
-- This script assumes there is at least one user in the 'auth.users' / 'public.profiles' table to act as the host.
-- It selects the first available user ID to use as 'host_id'.

WITH host_user AS (
  SELECT id FROM auth.users LIMIT 1
)
INSERT INTO public.properties (
  host_id,
  title,
  location,
  price_per_night,
  rating,
  images,
  max_guests,
  bedrooms,
  beds,
  baths,
  description,
  amenities
)
SELECT
  host_user.id,
  title,
  location,
  price,
  rating,
  images,
  guests,
  bedrooms,
  beds,
  baths,
  description,
  amenities
FROM
  host_user,
  (VALUES
    (
      'Cozy Family Suite',
      'Chaka Town, Nyeri',
      85,
      4.8,
      ARRAY['/lovable-uploads/31753fbf-d888-4d91-b12d-9754e8c01794.png'],
      4,
      2,
      3,
      2,
      'A lovely Apartment in the heart of Chaka Town, perfect for families.',
      ARRAY['Wifi', 'Parking', 'Kitchen']
    ),
    (
      'Charming Garden Cottage',
      'Chaka Town, Nyeri',
      65,
      4.7,
      ARRAY['/lovable-uploads/37cb5f82-cc77-4f57-b3f3-3d4108ae1642.png'],
      2,
      1,
      1,
      1,
      'A peaceful Cottage surrounded by lush gardens.',
      ARRAY['Wifi', 'Garden', 'Patio']
    ),
    (
      'Modern Comfort Home',
      'Chaka Town, Nyeri',
      95,
      4.9,
      ARRAY['/lovable-uploads/f32e2236-eedd-4fcd-a373-1e1c9522c2b6.png'],
      6,
      3,
      4,
      2,
      'A spacious and Modern Home with all amenities.',
      ARRAY['Wifi', 'Parking', 'Kitchen', 'TV', 'Washer']
    ),
    (
      'Nyeri Guest Suite',
      'Chaka Town, Nyeri',
      55,
      4.5,
      ARRAY['/lovable-uploads/a2d29d9a-0fa6-46d5-896b-87ae36676fb4.png'],
      2,
      1,
      1,
      1,
      'A comfortable Room ideal for solo travelers or couples.',
      ARRAY['Wifi', 'TV']
    ),
    (
      'Spacious Family House',
      'Chaka Town, Nyeri',
      120,
      4.9,
      ARRAY['/lovable-uploads/d2a418bd-5f74-4691-813f-5b77087024d9.png'],
      8,
      4,
      5,
      3,
      'A grand Home suitable for large groups and extended stays.',
      ARRAY['Wifi', 'Parking', 'Kitchen', 'Pool', 'Garden']
    ),
    (
      'Traditional Kenyan Home',
      'Chaka Town, Nyeri',
      75,
      4.6,
      ARRAY['/lovable-uploads/41a5ada2-d825-4a33-a5d2-d372cdda518f.png'],
      4,
      2,
      3,
      1,
      'Experience local living in this beautiful Traditional Home.',
      ARRAY['Parking', 'Garden']
    )
  ) AS data (title, location, price, rating, images, guests, bedrooms, beds, baths, description, amenities);

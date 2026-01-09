-- Create a demo host profile (linked to a placeholder auth.users id or just inserted for foreign key if not strict)
-- Note: In real Supabase, profiles are linked to auth.users. 
-- For seeding only properties, we might need a valid host_id. 
-- You might need to sign up a user first, get their UUID, and use it here.
-- OR, we can insert properties if we strictly follow the schema.

-- Start Transaction
BEGIN;

-- 1. Insert 3 Featured Properties
-- Note: Replace 'HEAR_INSERT_YOUR_USER_ID' with your actual User UUID from Supabase Auth > Users 
-- if you want to be the host. Otherwise, these might fail RLS or FK if not handled.
-- For the sake of this script, we assume RLS allows insert or we run this in SQL Editor (Service Role).

INSERT INTO properties (title, description, location, price_per_night, max_guests, bedrooms, beds, baths, rating, review_count, type, images, amenities, host_id)
VALUES 
(
    'Cozy Family Suite',
    'Experience authentic Kenyan hospitality in this comfortable family suite located in the heart of Chaka Town.',
    'Chaka Town, Nyeri',
    85,
    4,
    2,
    3,
    1,
    4.8,
    24,
    'Apartment',
    ARRAY['/lovable-uploads/31753fbf-d888-4d91-b12d-9754e8c01794.png', '/lovable-uploads/37cb5f82-cc77-4f57-b3f3-3d4108ae1642.png'],
    ARRAY['Wifi', 'Kitchen', 'Parking', 'TV'],
    auth.uid() -- This only works if you run it while authenticated in SQL editor context as a user, otherwise hardcode a UUID
),
(
    'Charming Garden Cottage',
    'A beautiful garden cottage perfect for couples or small families.',
    'Chaka Town, Nyeri',
    65,
    2,
    1,
    1,
    1,
    4.7,
    12,
    'Cottage',
    ARRAY['/lovable-uploads/37cb5f82-cc77-4f57-b3f3-3d4108ae1642.png'],
    ARRAY['Garden', 'Wifi', 'Breakfast'],
    auth.uid()
),
(
    'Modern Comfort Home',
    'Luxury living with modern amenities and stunning views.',
    'Chaka Town, Nyeri',
    95,
    6,
    3,
    4,
    2,
    4.9,
    30,
    'Home',
    ARRAY['/lovable-uploads/f32e2236-eedd-4fcd-a373-1e1c9522c2b6.png'],
    ARRAY['Pool', 'Wifi', 'Gym', 'Parking'],
    auth.uid()
);

COMMIT;

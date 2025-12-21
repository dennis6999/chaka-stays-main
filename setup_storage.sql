-- FIX: Create storage buckets and policies for Avatars and Property Images

-- 1. Create 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Create 'property-images' bucket if it doesn't exist (ensuring it's there too)
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- 3. Policy: Public Access for Avatars (Anyone can view)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 4. Policy: Authenticated Upload for Avatars (Users can upload)
create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 5. Policy: Users can update their own avatars (Optional, but good practice)
create policy "Users can update their own avatar"
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

-- (Repeat specific policies for property-images if needed, but existing ones might cover it)
create policy "Property images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'property-images' );

create policy "Authenticated users can upload property images"
  on storage.objects for insert
  with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );

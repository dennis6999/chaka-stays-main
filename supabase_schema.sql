-- Create a table for public profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  role text check (role in ('guest', 'host')) default 'guest',
  phone text
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a table for Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  host_id uuid references profiles(id) not null,
  title text not null,
  description text,
  location text,
  price_per_night numeric not null,
  max_guests integer default 2,
  bedrooms integer default 1,
  beds integer default 1,
  baths integer default 1,
  amenities text[],
  images text[],
  rating numeric default 0,
  review_count integer default 0
);

-- RLS for Properties
alter table properties enable row level security;

create policy "Properties are viewable by everyone."
  on properties for select
  using ( true );

create policy "Hosts can insert their own properties."
  on properties for insert
  with check ( auth.uid() = host_id );

create policy "Hosts can update their own properties."
  on properties for update
  using ( auth.uid() = host_id );

create policy "Hosts can delete their own properties."
  on properties for delete
  using ( auth.uid() = host_id );

-- Create a table for Bookings
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references properties(id) not null,
  guest_id uuid references profiles(id) not null,
  check_in date not null,
  check_out date not null,
  total_price numeric not null,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending'
);

-- RLS for Bookings
alter table bookings enable row level security;

create policy "Users can view their own bookings."
  on bookings for select
  using ( auth.uid() = guest_id );

create policy "Hosts can view bookings for their properties."
  on bookings for select
  using ( 
    auth.uid() in (
      select host_id from properties where id = property_id
    )
  );

create policy "Users can create bookings."
  on bookings for insert
  with check ( auth.uid() = guest_id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, phone)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'guest'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE SETUP
-- Create a storage bucket for property images (if it doesn't exist)
insert into storage.buckets (id, name, public) 
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Policies (Drop first to ensure clean state or updates)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'property-images' );

drop policy if exists "Authenticated users can upload images" on storage.objects;
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( 
    bucket_id = 'property-images' 
    and auth.role() = 'authenticated'
  );

drop policy if exists "Users can update own images" on storage.objects;
create policy "Users can update own images"
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'property-images' );

drop policy if exists "Users can delete own images" on storage.objects;
create policy "Users can delete own images"
  on storage.objects for delete
  using ( auth.uid() = owner and bucket_id = 'property-images' );

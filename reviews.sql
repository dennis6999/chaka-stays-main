-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate reviews from the same user for the same property
  unique(property_id, user_id)
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using ( true );

create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews"
  on public.reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using ( auth.uid() = user_id );

-- Create a function to calculate average rating
create or replace function public.handle_new_review()
returns trigger as $$
begin
  update public.properties
  set 
    review_count = (select count(*) from public.reviews where property_id = new.property_id),
    rating = (select coalesce(avg(rating), 0) from public.reviews where property_id = new.property_id)
  where id = new.property_id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Insert/Update
create trigger on_review_created
  after insert or update on public.reviews
  for each row execute procedure public.handle_new_review();

-- Trigger for Delete
create or replace function public.handle_deleted_review()
returns trigger as $$
begin
  update public.properties
  set 
    review_count = (select count(*) from public.reviews where property_id = old.property_id),
    rating = (select coalesce(avg(rating), 0) from public.reviews where property_id = old.property_id)
  where id = old.property_id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_review_deleted
  after delete on public.reviews
  for each row execute procedure public.handle_deleted_review();

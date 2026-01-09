-- Create favorites table
create table if not exists favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  property_id uuid references properties(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_id)
);

-- Enable RLS
alter table favorites enable row level security;

-- Policies
create policy "Users can view their own favorites"
  on favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

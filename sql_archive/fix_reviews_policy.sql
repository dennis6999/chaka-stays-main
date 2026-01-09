-- FIX: Ensure RLS policies allow viewing reviews and profiles

-- 1. Enable RLS on reviews just in case
alter table public.reviews enable row level security;

-- 2. Drop potentially conflicting/broken policies to start fresh
drop policy if exists "Reviews are viewable by everyone" on public.reviews;
drop policy if exists "Authenticated users can insert reviews" on public.reviews;
drop policy if exists "Users can update their own reviews" on public.reviews;
drop policy if exists "Users can delete their own reviews" on public.reviews;

-- 3. Re-create the SELECT policy (CRITICAL for viewing reviews)
create policy "Reviews are viewable by everyone"
  on public.reviews for select
  using ( true );

-- 4. Re-create the INSERT policy
create policy "Authenticated users can insert reviews"
  on public.reviews for insert
  with check ( auth.uid() = user_id );

-- 5. Re-create Update/Delete policies
create policy "Users can update their own reviews"
  on public.reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on public.reviews for delete
  using ( auth.uid() = user_id );

-- 6. Ensure Profiles are viewable (CRITICAL for the join to work)
-- We use "coalesce" logic or "do nothing if exists" via just creating it and letting it fail if duplicate?
-- Safest is to explicitly create it if we suspect it's missing.
-- Note: 'if not exists' doesn't checking policy names easily without plpgsql block.
-- We will just try to create it. If it errors saying "already exists", that's fine/good.

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'profiles' 
    and policyname = 'Public profiles are viewable by everyone'
  ) then
    create policy "Public profiles are viewable by everyone"
      on public.profiles for select
      using ( true );
  end if;
end
$$;

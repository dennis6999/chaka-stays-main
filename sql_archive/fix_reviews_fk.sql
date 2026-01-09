-- FIX: Ensure reviews table references public.profiles, NOT auth.users
-- This is required for the API to fetch user details (name/avatar) with the review.

-- 1. Drop the old constraint if it exists (might be named differently, so we try standardized names)
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'reviews_user_id_fkey') then
    alter table public.reviews drop constraint reviews_user_id_fkey;
  end if;
end $$;

-- 2. Add the correct Foreign Key pointing to PUBLIC.PROFILES
alter table public.reviews
  add constraint reviews_user_id_fkey 
  foreign key (user_id) 
  references public.profiles(id) 
  on delete cascade;

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

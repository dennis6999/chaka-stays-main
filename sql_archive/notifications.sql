-- Create Notifications Table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text default 'info', -- 'booking_alert', 'system', 'info'
  link text,
  is_read boolean default false
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications (mark as read)"
  on public.notifications for update
  using ( auth.uid() = user_id );

-- Trigger Function: Notify Host on New Booking
create or replace function public.notify_host_on_booking()
returns trigger as $$
declare
  host_id_var uuid;
  property_title_var text;
  guest_name_var text;
begin
  -- 1. Get Host ID and Property Title
  select host_id, title into host_id_var, property_title_var
  from public.properties
  where id = new.property_id;

  -- 2. Get Guest Name
  select full_name into guest_name_var
  from public.profiles
  where id = new.guest_id;

  -- 3. Insert Notification
  insert into public.notifications (user_id, title, message, type, link)
  values (
    host_id_var,
    'New Booking Request!',
    coalesce(guest_name_var, 'A guest') || ' has booked ' || property_title_var || '. Check your dashboard.',
    'booking_alert',
    '/dashboard'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Attach Trigger to Bookings
drop trigger if exists on_booking_created on public.bookings;
create trigger on_booking_created
  after insert on public.bookings
  for each row execute procedure public.notify_host_on_booking();

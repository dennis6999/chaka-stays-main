-- Update check_availability to ignore cancelled bookings
create or replace function check_availability(
  property_id uuid,
  check_in_date timestamp with time zone,
  check_out_date timestamp with time zone
)
returns boolean
language plpgsql
security definer
as $$
begin
  return not exists (
    select 1
    from bookings
    where bookings.property_id = check_availability.property_id
      and bookings.status != 'cancelled'
      and (bookings.check_in, bookings.check_out) overlaps (check_in_date, check_out_date)
  );
end;
$$;

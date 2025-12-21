-- Allow users to cancel their own bookings
-- Policy for UPDATE
create policy "Users can cancel their own bookings"
on bookings
for update
to authenticated
using (
  auth.uid() = guest_id
)
with check (
  auth.uid() = guest_id
);

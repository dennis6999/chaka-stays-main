-- Secure Cancellation Function
-- Bypasses RLS to ensure 100% reliability for users cancelling their own trips

CREATE OR REPLACE FUNCTION cancel_booking_secure(booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Perform update only if user owns the booking
    UPDATE bookings
    SET status = 'cancelled'
    WHERE id = booking_id
    AND guest_id = auth.uid();

    -- If no row was updated, it means ID is wrong or user doesn't own it
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Unable to cancel booking: You may not be the owner.';
    END IF;
END;
$$;

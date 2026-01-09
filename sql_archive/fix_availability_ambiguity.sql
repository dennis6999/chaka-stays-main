-- Drop ALL potential variations of the function to remove ambiguity
DROP FUNCTION IF EXISTS check_availability(uuid, date, date);
DROP FUNCTION IF EXISTS check_availability(uuid, timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS check_availability(uuid, text, text);
DROP FUNCTION IF EXISTS check_availability(uuid, timestamp, timestamp);

-- Recreate the single authoritative function
CREATE OR REPLACE FUNCTION check_availability(
    property_id UUID,
    check_in_date DATE,
    check_out_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Check for overlap in BOOKINGS
    SELECT COUNT(*)
    INTO conflict_count
    FROM bookings
    WHERE bookings.property_id = check_availability.property_id
      AND bookings.status != 'cancelled'
      AND bookings.check_in < check_availability.check_out_date
      AND bookings.check_out > check_availability.check_in_date;

    IF conflict_count > 0 THEN
        RETURN FALSE;
    END IF;

    -- Check for overlap in BLOCKED DATES
    SELECT COUNT(*)
    INTO conflict_count
    FROM blocked_dates
    WHERE blocked_dates.property_id = check_availability.property_id
      AND blocked_dates.start_date < check_availability.check_out_date
      AND blocked_dates.end_date > check_availability.check_in_date;

    IF conflict_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

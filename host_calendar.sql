-- 1. Create table for blocked dates
CREATE TABLE IF NOT EXISTS blocked_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

-- 2. RLS Policies for blocked_dates
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Public read access (availability checks need this)
CREATE POLICY "Public can view blocked dates"
ON blocked_dates FOR SELECT
USING (true);

-- Hosts can insert/delete their own blocks
CREATE POLICY "Hosts manage blocks for own properties"
ON blocked_dates FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM properties
        WHERE properties.id = blocked_dates.property_id
        AND properties.host_id = auth.uid()
    )
);

-- 3. Update check_availability function to include blocks
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

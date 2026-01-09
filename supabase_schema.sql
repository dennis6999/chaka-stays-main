-- ==========================================
-- CHAKA STAYS DATABASE SCHEMA (CONSOLIDATED)
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('guest', 'host')) DEFAULT 'guest',
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger for New User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, phone)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'guest'),
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. PROPERTIES
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  host_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  price_per_night NUMERIC NOT NULL,
  max_guests INTEGER DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  beds INTEGER DEFAULT 1,
  baths INTEGER DEFAULT 1,
  amenities TEXT[],
  images TEXT[],
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Properties Read" ON public.properties FOR SELECT USING (is_banned = FALSE);
CREATE POLICY "Admins Select All Properties" ON public.properties FOR SELECT USING ((SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE);
CREATE POLICY "Hosts Select Own Properties" ON public.properties FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own properties." ON public.properties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update their own properties." ON public.properties FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete their own properties." ON public.properties FOR DELETE USING (auth.uid() = host_id);


-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  guest_id UUID REFERENCES public.profiles(id) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending'
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings." ON public.bookings FOR SELECT USING (auth.uid() = guest_id);
CREATE POLICY "Hosts can view bookings for their properties." ON public.bookings FOR SELECT USING (auth.uid() IN (SELECT host_id FROM properties WHERE id = property_id));
CREATE POLICY "Users can create bookings." ON public.bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);


-- 5. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(property_id, user_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Trigger to Update Property Ratings
CREATE OR REPLACE FUNCTION public.handle_new_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties
  SET 
    review_count = (SELECT count(*) FROM public.reviews WHERE property_id = new.property_id),
    rating = (SELECT coalesce(avg(rating), 0) FROM public.reviews WHERE property_id = new.property_id)
  WHERE id = new.property_id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_new_review();

CREATE OR REPLACE FUNCTION public.handle_deleted_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties
  SET 
    review_count = (SELECT count(*) FROM public.reviews WHERE property_id = old.property_id),
    rating = (SELECT coalesce(avg(rating), 0) FROM public.reviews WHERE property_id = old.property_id)
  WHERE id = old.property_id;
  RETURN old;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_deleted AFTER DELETE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE public.handle_deleted_review();


-- 6. FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, property_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);


-- 7. BLOCKED DATES (Host Calendar)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view blocked dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Hosts manage blocks for own properties" ON blocked_dates FOR ALL USING (EXISTS (SELECT 1 FROM properties WHERE properties.id = blocked_dates.property_id AND properties.host_id = auth.uid()));


-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications (mark as read)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Trigger: Notify Host on Booking
CREATE OR REPLACE FUNCTION public.notify_host_on_booking()
RETURNS TRIGGER AS $$
DECLARE
  host_id_var UUID;
  property_title_var TEXT;
  guest_name_var TEXT;
BEGIN
  -- 1. Get Host ID and Property Title
  SELECT host_id, title INTO host_id_var, property_title_var FROM public.properties WHERE id = new.property_id;
  -- 2. Get Guest Name
  SELECT full_name INTO guest_name_var FROM public.profiles WHERE id = new.guest_id;
  -- 3. Insert Notification
  INSERT INTO public.notifications (user_id, title, message, type, link)
  VALUES (host_id_var, 'New Booking Request!', COALESCE(guest_name_var, 'A guest') || ' has booked ' || property_title_var || '. Check your dashboard.', 'booking_alert', '/dashboard');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_created AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE PROCEDURE public.notify_host_on_booking();


-- 9. STORAGE SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('property-images', 'avatars'));
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('property-images', 'avatars') AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (auth.uid() = owner);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (auth.uid() = owner);


-- 10. RPC FUNCTIONS

-- Check Availability (Includes Blocked Dates)
CREATE OR REPLACE FUNCTION check_availability(property_id UUID, check_in_date DATE, check_out_date DATE)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count FROM bookings
    WHERE bookings.property_id = check_availability.property_id
      AND bookings.status != 'cancelled'
      AND bookings.check_in < check_availability.check_out_date
      AND bookings.check_out > check_availability.check_in_date;
    IF conflict_count > 0 THEN RETURN FALSE; END IF;

    SELECT COUNT(*) INTO conflict_count FROM blocked_dates
    WHERE blocked_dates.property_id = check_availability.property_id
      AND blocked_dates.start_date < check_availability.check_out_date
      AND blocked_dates.end_date > check_availability.check_in_date;
    IF conflict_count > 0 THEN RETURN FALSE; END IF;

    RETURN TRUE;
END;
$$;

-- Toggle Ban Property (Admin)
CREATE OR REPLACE FUNCTION toggle_ban_property(p_id UUID, ban_status BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (SELECT is_admin FROM profiles WHERE id = auth.uid()) THEN
    UPDATE properties SET is_banned = ban_status WHERE id = p_id;
  ELSE
    RAISE EXCEPTION 'Access Denied: You are not an admin.';
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION toggle_ban_property TO authenticated;

-- Get Admin Stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
   u_count INT;
   p_count INT;
   b_count INT;
   r_total NUMERIC;
BEGIN
   SELECT count(*) INTO u_count FROM profiles;
   SELECT count(*) INTO p_count FROM properties;
   SELECT count(*) INTO b_count FROM bookings;
   SELECT COALESCE(SUM(total_price), 0) INTO r_total FROM bookings WHERE status != 'cancelled';
   RETURN json_build_object('users', u_count, 'properties', p_count, 'bookings', b_count, 'revenue', r_total);
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_stats TO postgres;
GRANT EXECUTE ON FUNCTION get_admin_stats TO anon;
GRANT EXECUTE ON FUNCTION get_admin_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_stats TO service_role;
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export interface Property {
    id: string;
    host_id: string;
    title: string;
    description: string;
    location: string;
    price_per_night: number;
    max_guests: number;
    bedrooms: number;
    beds: number;
    baths: number;
    amenities: string[];
    images: string[];
    property_type?: string;
    is_banned?: boolean;
    rating: number;
    review_count: number;
    created_at: string;
    host?: {
        id: string;
        full_name: string;
        avatar_url: string;
    };
}

export interface Booking {
    id: string;
    property_id: string;
    guest_id: string;
    check_in: string;
    check_out: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    created_at: string;
    properties?: Property; // Join result
}

export interface Review {
    id: string;
    property_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: {
        full_name: string;
        avatar_url: string;
    };
}

const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms));

export const api = {
    // --- Properties ---

    async getProperties() {
        const fetchPromise = supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        const { data, error } = await Promise.race([
            fetchPromise,
            timeout(10000)
        ]) as { data: Property[] | null; error: PostgrestError | null };

        if (error) throw error;
        return data as Property[];
    },

    async getFeaturedProperties() {
        // For now, just getting the first 3. In real app, could filter by rating > 4.5
        const fetchPromise = supabase
            .from('properties')
            .select('*')
            .limit(3);

        const { data, error } = await Promise.race([
            fetchPromise,
            timeout(10000)
        ]) as { data: Property[] | null; error: PostgrestError | null };

        if (error) throw error;
        return data as Property[];
    },

    // ... rest of the file (keep existing methods)

    async getProperty(id: string) {
        const { data, error } = await supabase
            .from('properties')
            .select(`
        *,
        host:profiles(id, full_name, avatar_url) 
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async getHostProperties(hostId: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('host_id', hostId);

        if (error) throw error;
        return data as Property[];
    },

    async createProperty(property: Omit<Property, 'id' | 'created_at' | 'rating' | 'review_count'>) {
        const { data, error } = await supabase
            .from('properties')
            .insert(property)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateProperty(id: string, updates: Partial<Property>) {
        const { data, error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteProperty(id: string) {
        const { error } = await supabase
            .rpc('delete_property_secure', { p_id: id });

        if (error) throw error;
    },

    // --- Bookings ---

    async getUserBookings(userId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
        *,
        properties:properties(*)
      `)
            .eq('guest_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Booking[];
    },

    async getHostBookings(hostId: string) {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                properties!inner(*)
            `)
            .eq('properties.host_id', hostId)
            .neq('status', 'cancelled')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Booking[];
    },

    async getPropertyBookings(propertyId: string) {
        // Fetch Bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('check_in, check_out')
            .eq('property_id', propertyId)
            .neq('status', 'cancelled')
            .gte('check_out', new Date().toISOString().split('T')[0]);

        if (bookingsError) throw bookingsError;

        // Fetch Blocked Dates
        const { data: blocks, error: blocksError } = await supabase
            .from('blocked_dates')
            .select('start_date, end_date')
            .eq('property_id', propertyId)
            .gte('end_date', new Date().toISOString().split('T')[0]);

        if (blocksError) throw blocksError;

        // Normalize data structure
        const bookingDates = (bookings || []).map(b => ({ check_in: b.check_in, check_out: b.check_out, type: 'booking' }));
        const blockedDates = (blocks || []).map(b => ({ check_in: b.start_date, check_out: b.end_date, type: 'blocked' }));

        return [...bookingDates, ...blockedDates];
    },

    async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date) {
        const { data, error } = await supabase
            .rpc('check_availability', {
                property_id: propertyId,
                check_in_date: checkIn.toISOString().split('T')[0],
                check_out_date: checkOut.toISOString().split('T')[0]
            });

        if (error) throw error;
        return data as boolean;
    },

    async cancelBooking(bookingId: string) {
        const { error } = await supabase
            .rpc('cancel_booking_secure', { booking_id: bookingId });

        if (error) throw error;
    },

    // --- Blocked Dates (Calendar) ---

    async blockDates(block: { property_id: string; start_date: Date; end_date: Date; reason?: string }) {
        const { data, error } = await supabase
            .from('blocked_dates')
            .insert({
                property_id: block.property_id,
                start_date: block.start_date.toISOString(),
                end_date: block.end_date.toISOString(),
                reason: block.reason
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async removeBlock(blockId: string) {
        const { error } = await supabase
            .from('blocked_dates')
            .delete()
            .eq('id', blockId);

        if (error) throw error;
    },

    async getBlockedDates(propertyId: string) {
        const { data, error } = await supabase
            .from('blocked_dates')
            .select('*')
            .eq('property_id', propertyId);

        if (error) throw error;
        return data as { id: string; start_date: string; end_date: string; reason?: string }[];
    },

    async createBooking(booking: {
        property_id: string;
        guest_id: string;
        check_in: Date;
        check_out: Date;
        total_price: number;
    }) {
        // 1. Safety Check: Is property banned?
        const { data: property, error: propError } = await supabase
            .from('properties')
            .select('is_banned')
            .eq('id', booking.property_id)
            .single();

        if (propError || !property) throw new Error("Property not found");
        if (property.is_banned) throw new Error("This property is no longer accepting bookings.");

        // 2. Proceed with booking
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                ...booking,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // --- Reviews ---

    async getReviews(propertyId: string) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                user:profiles(full_name, avatar_url)
            `)
            .eq('property_id', propertyId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Review[];
    },

    async createReview(review: { property_id: string; user_id: string; rating: number; comment: string }) {
        const { data, error } = await supabase
            .from('reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateProfile(userId: string, updates: { full_name?: string; phone?: string; avatar_url?: string }) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async uploadAvatar(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            // If avatars bucket doesn't exist, try property-images as fallback or handle error
            console.error('Avatar upload error:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // --- Storage ---

    async uploadImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // --- Favorites ---

    async getFavoriteStatus(propertyId: string, userId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('property_id', propertyId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;
        return !!data;
    },

    async addFavorite(propertyId: string, userId: string) {
        const { error } = await supabase
            .from('favorites')
            .insert({ property_id: propertyId, user_id: userId });

        if (error) throw error;
    },

    async removeFavorite(propertyId: string, userId: string) {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('property_id', propertyId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    async getUserFavorites(userId: string) {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
                property_id,
                property:properties(*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        // Map to return just the property objects
        return data.map(f => f.property) as unknown as Property[];
    },

    // --- Admin ---

    async isAdmin(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', userId)
            .single();

        if (error) return false;
        return data?.is_admin || false;
    },

    async getAdminStats() {
        const { data, error } = await supabase.rpc('get_admin_stats');

        if (error) {
            console.error('Admin Stats RPC Error:', error);
            // SHOW THE USER why it failed
            toast.error(`Admin Stats Error: ${error.message}`);
            return { users: 0, properties: 0, bookings: 0, revenue: 0 };
        }

        return {
            users: data.users || 0,
            properties: data.properties || 0,
            bookings: data.bookings || 0,
            revenue: data.revenue || 0
        };
    },

    async toggleBanProperty(id: string, banStatus: boolean) {
        const { error } = await supabase.rpc('toggle_ban_property', {
            p_id: id,
            ban_status: banStatus
        });

        if (error) throw error;
    },

    async getAllUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // --- Notifications ---

    async getNotifications() {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async markNotificationRead(id: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    // --- Payments (Simulation) ---

    async processMpesaPayment(phoneNumber: string, amount: number) {
        // Simulate network delay for STK Push
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Simulate success (90% chance)
        // In a real app, this would be a backend polling mechanism checking for a callback
        const isSuccess = Math.random() > 0.1;

        if (!isSuccess) {
            throw new Error("Payment failed or was cancelled by user.");
        }

        return {
            success: true,
            receipt: `MPS${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            timestamp: new Date().toISOString()
        };
    }
};

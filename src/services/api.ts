import { supabase } from '@/lib/supabase';

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
        ]) as any;

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
        ]) as any;

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
        const { error, count } = await supabase
            .from('properties')
            .delete({ count: 'exact' })
            .eq('id', id);

        if (error) throw error;
        // If no rows deleted, it means either ID doesn't exist OR RLS hid it (permission denied)
        if (count === 0) throw new Error("Could not delete property. You may not be the owner.");
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

    async createBooking(booking: {
        property_id: string;
        guest_id: string;
        check_in: Date;
        check_out: Date;
        total_price: number;
    }) {
        const { data, error } = await supabase
            .from('bookings')
            .insert({
                ...booking,
                status: 'confirmed' // Auto-confirm for demo
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
    }
};

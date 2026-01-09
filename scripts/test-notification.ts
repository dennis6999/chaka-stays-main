import { createClient } from '@supabase/supabase-js';

// Hardcoded for testing to avoid installing dotenv
const supabaseUrl = 'https://iruwbkwlyvowtwiohtyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydXdia3dseXZvd3R3aW9odHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNDMyMjcsImV4cCI6MjA4MTgxOTIyN30.MVhvEJkk880J9ptg2mlr5amdwl_kQqwBpZIc5tBMd6w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotification() {
    console.log('--- TEST NOTIFICATION TRIGGER ---');

    // 1. Get a random Host property
    const { data: properties } = await supabase.from('properties').select('id, host_id, title').limit(1);
    if (!properties || properties.length === 0) {
        console.error('No properties found. Cannot test.');
        return;
    }
    const property = properties[0];
    console.log(`Target Property: ${property.title} (Host: ${property.host_id})`);

    // 2. Create a temporary Test Guest
    const email = `test.guest.${Date.now()}@example.com`;
    const password = 'testpassword123';

    console.log(`Creating test user: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Test Verify Bot' }
        }
    });

    if (authError || !authData.user) {
        console.error('Failed to create test user:', authError);
        return;
    }
    const guest = authData.user;
    console.log(`Guest created: ${guest.id}`);

    // 3. Create Booking (Authenticated)
    // We don't need to re-init client if we sign up, supabase-js handles session automatically for subsequent requests usually,
    // BUT in a script context without persistent storage it might be safer to pass the token or relies on the instance state.
    // The singleton instance `supabase` should hold the session after signUp.

    console.log('Creating booking...');
    const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
        property_id: property.id,
        guest_id: guest.id,
        check_in: new Date().toISOString(),
        check_out: new Date(Date.now() + 86400000).toISOString(),
        total_price: 1000,
        status: 'confirmed'
    }).select().single();

    if (bookingError) {
        console.error('Failed to create booking:', bookingError);
        return;
    }
    console.log('Booking created successfully:', booking.id);
    console.log('If the Trigger failed, this insert would likely have failed. Success implies trigger ran cleanly.');

    // 4. Wait for Trigger
    console.log('Waiting for trigger...');
    await new Promise(r => setTimeout(r, 2000));

    // 5. Check Notifications
    const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', property.host_id)
        .order('created_at', { ascending: false })
        .limit(1);

    if (notifError) {
        console.error('Error checking notifications:', notifError);
        return;
    }

    if (notifications && notifications.length > 0) {
        const latest = notifications[0];

        // Check if it matches our booking context (fuzzy match title to be safe)
        if (latest.type === 'booking_alert' && latest.message.indexOf('booked') !== -1) {
            console.log('SUCCESS: Notification found!');
            console.log('ID:', latest.id);
            console.log('Message:', latest.message);
        } else {
            console.warn('WARNING: Latest notification does not seem to match expected alert.');
            console.log('Latest:', latest);
        }
    } else {
        console.error('FAIL: No notification found for host.');
    }

    // Cleanup (Booking only, User difficult to delete without admin)
    console.log('Cleaning up booking...');
    await supabase.from('bookings').delete().eq('id', booking.id);
}

testNotification();

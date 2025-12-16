
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';

// 1. Load Environment Variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        envVars[key] = value;
    }
});

const STRIPE_SECRET_KEY = envVars['STRIPE_SECRET_KEY'];
const NEXT_PUBLIC_SUPABASE_URL = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];

console.log("--- Payment System Verification ---");

if (!STRIPE_SECRET_KEY || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(STRIPE_SECRET_KEY, { typescript: true });

(async () => {
    let testUserId: string | null = null;
    let testCourtId: string | null = null;

    try {
        console.log("✅ Credentials found.");

        // 1. Create Test User
        const randomSuffix = Math.floor(Math.random() * 10000);
        const email = `payment_test_${randomSuffix}@example.com`;

        const { data: userData, error: userError } = await supabase.auth.admin.createUser({
            email,
            password: 'securepassword123',
            email_confirm: true
        });

        if (userError || !userData.user) {
            throw new Error(`Failed to create test user: ${userError?.message}`);
        }
        testUserId = userData.user.id;
        console.log(`✅ Created test user: ${testUserId}`);

        // 2. Create Test Court
        const { data: courtData, error: courtError } = await supabase.from('courts').insert({
            name: `Test Court ${randomSuffix}`,
            access_type: 'public'
        }).select().single();

        if (courtError || !courtData) {
            throw new Error(`Failed to create test court: ${courtError?.message}`);
        }
        testCourtId = courtData.id;
        console.log(`✅ Created test court: ${testCourtId}`);

        // 3. Create Test Event
        const { data: eventData, error: eventError } = await supabase.from('events').insert({
            court_id: testCourtId,
            title: `Test Event ${randomSuffix}`,
            starts_at: new Date().toISOString(),
            event_kind: 'tournament',
            cost_cents: 2000
        }).select().single();

        if (eventError || !eventData) {
            throw new Error(`Failed to create test event: ${eventError?.message}`);
        }
        console.log(`✅ Created test event: ${eventData.id}`);

        // 4. Test Registration with Payment Fields (The Core Test)
        const { data: regData, error: regError } = await supabase.from('event_registrations').insert({
            event_id: eventData.id,
            user_id: testUserId,
            status: 'confirmed',
            payment_status: 'paid',
            stripe_session_id: 'sess_test_verification_script',
            amount_paid_cents: 2000
        }).select();

        if (regError) {
            throw new Error(`❌ Insert into event_registrations failed: ${regError.message}`);
        }

        console.log("✅ Successfully inserted registration with payment columns!");

        // 5. Test Stripe Checkout Session Creation
        try {
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Test Event ${randomSuffix}`,
                                description: 'Verification Script Test',
                            },
                            unit_amount: 2000,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: 'http://localhost:3000/success',
                cancel_url: 'http://localhost:3000/cancel',
                metadata: {
                    eventId: eventData.id,
                    userId: testUserId,
                    type: 'event_registration'
                },
                customer_email: email,
            });
            console.log(`✅ Stripe API Connection Works: Created Session ${session.id}`);
        } catch (stripeError: any) {
            console.error(`❌ Stripe API Error: ${stripeError.message}`);
        }

        console.log("   (This confirms stripe_migration.sql was applied and schema is correct)");

    } catch (e: any) {
        console.error("❌ Test Failed:", e.message);
    } finally {
        // Cleanup
        if (testUserId) {
            const { error } = await supabase.auth.admin.deleteUser(testUserId);
            if (error) console.error("⚠️ Failed to delete test user:", error.message);
            else console.log("✅ Cleaned up test user.");
        }
        if (testCourtId) {
            // Cascade should handle event and registrations, but we delete court.
            const { error } = await supabase.from('courts').delete().eq('id', testCourtId);
            if (error) console.error("⚠️ Failed to delete test court:", error.message);
            else console.log("✅ Cleaned up test court.");
        }
    }
})();

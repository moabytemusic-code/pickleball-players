import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return new NextResponse("Missing signature or secret", { status: 400 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const metadata = session.metadata;

        if (metadata && metadata.type === 'event_registration') {
            const { eventId, userId } = metadata;

            // Connect to Supabase as Admin
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Insert Registration
            const { error } = await supabaseAdmin.from('event_registrations').insert({
                event_id: eventId,
                user_id: userId,
                status: 'confirmed',
                payment_status: 'paid',
                stripe_session_id: session.id,
                amount_paid_cents: session.amount_total
            });

            if (error) {
                console.error("Error creating registration from webhook", error);
                // Note: We might want to return 500 here to retry, but for now we log it.
                // Duplicate key error might happen if webhook fires twice.
            } else {
                console.log(`✅ Registration created via webhook for user ${userId}`);
            }
        }
    }

    return new NextResponse('Received', { status: 200 });
}

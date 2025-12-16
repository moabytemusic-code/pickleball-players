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
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const metadata = session.metadata;

        if (metadata && metadata.type === 'event_registration') {
            const { eventId, userId } = metadata;

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
            } else {
                console.log(`✅ Registration created via webhook for user ${userId}`);
            }
        }

        // Handle Subscription Checkout
        else if (metadata && metadata.type === 'pro_subscription') {
            const { userId, businessId } = metadata;
            console.log(`✅ Subscription checkout completed for Business ${businessId}`);

            // We can rely on 'customer.subscription.created' for the main DB insert,
            // but we might want to ensure 'stripe_customer_id' is saved here if needed immediately.
        }
    }

    // --- Subscription Events ---
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;
        // We need to look up which business this is for.
        // Ideally we stored businessId in subscription metadata.
        // But Stripe subscriptions don't always inherit metadata from checkout unless configured.
        // A fallback common pattern is to lookup by stripe_customer_id in our DB, if we saved it on checkout/session.
        // OR we can rely on the Checkout Session metadata -> But here we are in a sub event.

        // BETTER: When creating the checkout session, we should have set `subscription_data: { metadata: { businessId: ... } }`.

        // Let's check metadata
        const businessId = subscription.metadata.businessId;

        if (businessId) {
            const { error } = await supabaseAdmin.from('subscriptions').upsert({
                business_id: businessId,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end,
                updated_at: new Date().toISOString()
            }, { onConflict: 'business_id' });

            if (error) console.error("Error upserting subscription", error);
            else console.log(`✅ Subscription synced for business ${businessId} [${subscription.status}]`);
        }
    }

    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        // Update status to canceled
        const { error } = await supabaseAdmin.from('subscriptions')
            .update({ status: 'canceled', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subscription.id);

        if (error) console.error("Error canceling subscription", error);
        else console.log(`✅ Subscription marked canceled: ${subscription.id}`);
    }

    return new NextResponse('Received', { status: 200 });
}

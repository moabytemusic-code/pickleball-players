'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

import { stripe } from '@/lib/stripe';

export async function registerForEvent(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to register.' };
    }

    // 1. Fetch Event Details (Cost)
    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

    if (!event) return { error: "Event not found" };

    // 2. Check if already registered
    const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        // If pending payment, maybe allow re-checkout? For now just block.
        if (existing.payment_status === 'pending') {
            // Optional: could return existing checkout url if we stored it, or delete and retry.
            // For simplicity, let them cancel and retry.
            return { error: 'You have a pending registration. Please cancel it and try again.' };
        }
        return { error: 'You are already registered for this event.' };
    }

    // 3. Handle Payment
    if (event.cost_cents > 0) {
        if (!process.env.STRIPE_SECRET_KEY) {
            return { error: "Payment system not configured (Missing STRIPE_SECRET_KEY)" };
        }

        try {
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: event.title,
                                description: `Registration for ${event.event_kind.replace('_', ' ')}`,
                            },
                            unit_amount: event.cost_cents,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tournaments/${eventId}?success=true`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/tournaments/${eventId}?canceled=true`,
                metadata: {
                    eventId: eventId,
                    userId: user.id,
                    type: 'event_registration'
                },
                customer_email: user.email,
            });

            if (session.url) {
                return { checkoutUrl: session.url };
            }
        } catch (e: any) {
            console.error("Stripe Error", e);
            return { error: `Payment initialization failed: ${e.message}` };
        }
    }

    // 4. Free Registration (Direct DB Insert)
    const { error } = await supabase
        .from('event_registrations')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed',
            payment_status: 'paid', // verified free
            amount_paid_cents: 0
        });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/tournaments/${eventId}`);
    return { success: true };
}

export async function cancelRegistration(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath(`/tournaments/${eventId}`);
    return { success: true };
}

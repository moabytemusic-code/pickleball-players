'use server'

import { createClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function checkOwnership(supabase: any, eventId: string, userId: string) {
    const { data: event, error } = await supabase
        .from('events')
        .select('*, business:businesses(owner_user_id)')
        .eq('id', eventId)
        .single();

    if (error || !event) return false;
    // Check if the business owner is the current user
    if (event.business?.owner_user_id !== userId) return false;
    return true;
}

export async function refundParticipant(eventId: string, userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const isOwner = await checkOwnership(supabase, eventId, user.id);
    if (!isOwner) return { error: 'Unauthorized: You do not own this event.' }

    // 1. Get Registration
    const { data: reg, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

    if (error || !reg) {
        return { error: 'Registration not found' }
    }

    if (reg.payment_status === 'refunded') {
        return { error: 'Already refunded' }
    }

    if (!reg.stripe_session_id) {
        // Was free or legacy
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({ payment_status: 'refunded' })
            .eq('event_id', eventId)
            .eq('user_id', userId)

        if (updateError) return { error: 'Failed to update status' }

        revalidatePath(`/pro/dashboard/events/${eventId}`)
        return { success: true }
    }

    // 2. Process Refund via Stripe
    try {
        const session = await stripe.checkout.sessions.retrieve(reg.stripe_session_id);
        const paymentIntentId = session.payment_intent as string;

        if (paymentIntentId) {
            await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });
        }

        // 3. Update DB
        const { error: updateError } = await supabase
            .from('event_registrations')
            .update({ payment_status: 'refunded' })
            .eq('event_id', eventId)
            .eq('user_id', userId)

        if (updateError) throw new Error('DB update failed');

        revalidatePath(`/pro/dashboard/events/${eventId}`)
        return { success: true }

    } catch (err: any) {
        console.error('Refund error:', err);
        return { error: err.message || 'Refund failed' }
    }
}

export async function cancelEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const isOwner = await checkOwnership(supabase, eventId, user.id);
    if (!isOwner) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', eventId)

    if (error) return { error: error.message }

    revalidatePath(`/pro/dashboard/events/${eventId}`)
    revalidatePath(`/pro/dashboard/events`)

    return { success: true }
}

export async function publishEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const isOwner = await checkOwnership(supabase, eventId, user.id);
    if (!isOwner) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('events')
        .update({ is_active: true })
        .eq('id', eventId)

    if (error) return { error: error.message }

    revalidatePath(`/pro/dashboard/events/${eventId}`)
    revalidatePath(`/pro/dashboard/events`)

    return { success: true }
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const isOwner = await checkOwnership(supabase, eventId, user.id);
    if (!isOwner) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

    if (error) return { error: error.message }

    revalidatePath(`/pro/dashboard/events`)
}

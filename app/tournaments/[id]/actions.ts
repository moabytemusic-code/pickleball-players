'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function registerForEvent(eventId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to register.' };
    }

    // Check if already registered
    const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { error: 'You are already registered for this event.' };
    }

    const { error } = await supabase
        .from('event_registrations')
        .insert({
            event_id: eventId,
            user_id: user.id,
            status: 'confirmed'
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

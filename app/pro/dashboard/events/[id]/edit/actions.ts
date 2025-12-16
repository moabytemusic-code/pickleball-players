
'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateEvent(eventId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // 1. Verify Ownership via Business -> Event
    // We need to check if the event belongs to a business owned by the user.
    // Or, more simply, fetch the event and check the business owner.

    const { data: eventData } = await supabase
        .from('events')
        .select('*, business:businesses(owner_user_id)')
        .eq('id', eventId)
        .single();

    if (!eventData || eventData.business?.owner_user_id !== user.id) {
        return { error: "You do not have permission to edit this event." };
    }

    // 2. Parse Form Data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const durationHours = parseFloat(formData.get('duration') as string) || 1;
    const kind = formData.get('kind') as string;
    const costDollars = parseFloat(formData.get('cost') as string) || 0;
    const skill_level = formData.get('skill') as string;

    // 3. Construct Timestamps & Costs
    // starts_at
    const startDateTime = new Date(`${date}T${time}:00`);
    if (isNaN(startDateTime.getTime())) {
        return { error: "Invalid date or time." };
    }

    // ends_at
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);

    // cost_cents
    const cost_cents = Math.round(costDollars * 100);

    // 4. Update Event
    const { error } = await supabase.from('events').update({
        title,
        description,
        starts_at: startDateTime.toISOString(),
        ends_at: endDateTime.toISOString(),
        event_kind: kind,
        cost_cents,
        skill_level,
    }).eq('id', eventId);

    if (error) return { error: error.message };

    revalidatePath(`/pro/dashboard/events/${eventId}`);
    revalidatePath(`/court/${eventData.court_id}`);

    return { success: true };
}

'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(courtId: string, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Must be logged in." };
    }

    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const duration = formData.get('duration') as string; // in hours
    const kind = formData.get('kind') as string;
    const cost = formData.get('cost') as string;
    const skill = formData.get('skill') as string;

    if (!title || !date || !time) {
        return { error: "Missing required fields" };
    }

    // Combine Date and Time
    // Date: YYYY-MM-DD, Time: HH:MM
    const startDateTime = new Date(`${date}T${time}:00`);

    // Calculate End Time (simple approach)
    const endDateTime = new Date(startDateTime.getTime() + (parseFloat(duration || '1') * 60 * 60 * 1000));

    const { error } = await supabase.from('events').insert({
        court_id: courtId,
        // business_id: ... only if owner
        title,
        starts_at: startDateTime.toISOString(),
        ends_at: endDateTime.toISOString(),
        event_kind: kind,
        cost_cents: cost ? Math.round(parseFloat(cost) * 100) : 0,
        skill_level: skill,
        is_active: true
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function submitReview(courtId: string, rating: number, comment: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to review." };
    }

    const { error } = await supabase.from('reviews').insert({
        court_id: courtId,
        user_id: user.id,
        rating,
        comment
    });

    if (error) {
        if (error.code === '23505') { // Unique violation
            return { error: "You have already reviewed this court." };
        }
        return { error: error.message };
    }

    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

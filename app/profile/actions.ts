'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deleteReview(reviewId: string) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Delete (RLS will ensure they own it)
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/profile');
    revalidatePath('/court/[id]'); // We can't easily revalidate wildcards, but revalidatePath('/') might help or specific caches.
    // Ideally we revalidate the specific court page if we knew the ID, but for now Profile update is key.
}

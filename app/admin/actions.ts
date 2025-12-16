'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// TODO: ADD YOUR EMAIL HERE
const ADMIN_EMAILS = ['admin@example.com', 'user@example.com'];

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || (!ADMIN_EMAILS.includes(user.email || '') && !user.email?.endsWith('@example.com'))) {
        // allowing @example.com for testing, REMOVE IN PROD
        // return false; 
        return true; // FOR DEV: ALLOW ALL LOGGED IN USERS TO ACCESS ADMIN
    }
    return true;
}

export async function approveClaim(claimId: string, courtId: string) {
    if (!await checkAdmin()) return { error: "Unauthorized" };

    const supabase = await createClient();

    // 1. Update Claim
    const { error: claimError } = await supabase
        .from('claims')
        .update({ status: 'verified', verified_at: new Date().toISOString() })
        .eq('id', claimId);

    if (claimError) return { error: claimError.message };

    // 2. Update Court
    const { error: courtError } = await supabase
        .from('courts')
        .update({ is_claimed: true, verified_badge: true })
        .eq('id', courtId);

    if (courtError) return { error: courtError.message };

    revalidatePath('/admin/claims');
    return { success: true };
}

export async function rejectClaim(claimId: string) {
    if (!await checkAdmin()) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase
        .from('claims')
        .update({ status: 'rejected' })
        .eq('id', claimId);

    if (error) return { error: error.message };

    revalidatePath('/admin/claims');
    return { success: true };
}

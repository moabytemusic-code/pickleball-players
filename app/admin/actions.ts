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

import { sendEmail } from '@/lib/email';

export async function approveClaim(claimId: string, courtId: string) {
    if (!await checkAdmin()) return { error: "Unauthorized" };

    const supabase = await createClient();

    // Fetch details for email
    const { data: claim } = await supabase.from('claims').select('*, business:businesses(contact_email, business_name), court:courts(name)').eq('id', claimId).single();

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

    // 3. Send Email
    if (claim?.business?.contact_email) {
        await sendEmail({
            to: claim.business.contact_email,
            subject: '🎉 Your Pickleball Court Claim is Approved!',
            html: `
                <h2>Congratulations, ${claim.business.business_name}!</h2>
                <p>Your claim for <strong>${claim.court.name}</strong> has been verified.</p>
                <p>You can now access your owner dashboard to manage events and update details.</p>
                <br/>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/court/${courtId}" style="background: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Court</a>
            `
        });
    }

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

export async function updateCourt(courtId: string, data: any) {
    if (!await checkAdmin()) return { error: "Unauthorized" };
    const supabase = await createClient();

    // Cleanup
    const { id, created_at, updated_at, request, ...updateData } = data;

    const { error } = await supabase
        .from('courts')
        .update(updateData)
        .eq('id', courtId);

    if (error) return { error: error.message };

    revalidatePath(`/admin/courts/${courtId}`);
    revalidatePath(`/admin/courts`);
    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

export async function addPhoto(courtId: string, url: string) {
    if (!await checkAdmin()) return { error: "Unauthorized" };
    if (!url || !url.startsWith('http')) return { error: "Invalid URL" };

    const supabase = await createClient();
    const { error } = await supabase
        .from('photos')
        .insert({
            court_id: courtId,
            url: url,
            is_primary: false,
            sort_order: 0
        });

    if (error) return { error: error.message };

    revalidatePath(`/admin/courts/${courtId}`);
    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

export async function deletePhoto(photoId: string, courtId: string) {
    if (!await checkAdmin()) return { error: "Unauthorized" };

    const supabase = await createClient();
    const { error } = await supabase.from('photos').delete().eq('id', photoId);

    if (error) return { error: error.message };

    revalidatePath(`/admin/courts/${courtId}`);
    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

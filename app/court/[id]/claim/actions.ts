'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function submitClaim(courtId: string, formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to claim a court." };
    }

    const businessName = formData.get('business_name') as string;
    const contactName = formData.get('contact_name') as string;
    const contactPhone = formData.get('contact_phone') as string;
    const notes = formData.get('notes') as string;

    if (!businessName || !contactName) {
        return { error: "Missing required fields." };
    }

    // 2. Check if already claimed
    const { data: existingClaim } = await supabase
        .from('claims')
        .select('*')
        .eq('court_id', courtId)
        .eq('status', 'verified')
        .single();

    if (existingClaim) {
        return { error: "This court has already been claimed by a verified owner." };
    }

    // 3. Create or Get Business Profile
    // For simplicity, we create a new business entry for this claim
    // In a real app, we'd let them select an existing business profile
    const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
            owner_user_id: user.id,
            business_name: businessName,
            contact_name: contactName,
            contact_phone: contactPhone
        })
        .select()
        .single();

    if (bizError) {
        return { error: "Failed to create business profile: " + bizError.message };
    }

    // 4. Create Claim
    const { error: claimError } = await supabase
        .from('claims')
        .insert({
            court_id: courtId,
            business_id: business.id,
            status: 'pending',
            verification_notes: notes
        });

    if (claimError) {
        return { error: "Failed to submit claim: " + claimError.message };
    }

    revalidatePath(`/court/${courtId}`);
    return { success: true };
}

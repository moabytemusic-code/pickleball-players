
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { PhotoManager } from './photo-manager'
import { EditListingForm } from './edit-listing-form'
import { ArrowLeft } from 'lucide-react'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/pro/dashboard/listings/${id}`);
    }

    // 1. Fetch Court & Validate Ownership
    // We check valid claims for this user
    // Fallback manual check:
    const { data: businesses } = await supabase.from('businesses').select('id').eq('owner_user_id', user.id);
    const businessIds = businesses?.map(b => b.id) || [];

    const { data: validClaim } = await supabase
        .from('claims')
        .select('*')
        .eq('court_id', id)
        .eq('status', 'verified')
        .in('business_id', businessIds)
        .single();

    if (!validClaim) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-xl font-bold">Access Denied</h1>
                <p>You do not have permission to manage this listing.</p>
                <Link href="/pro/dashboard/listings" className="text-primary hover:underline mt-4 block">Back to Listings</Link>
            </div>
        )
    }

    // 2. Fetch Court Data
    const { data: court } = await supabase
        .from('courts')
        .select('*')
        .eq('id', id)
        .single();

    // 3. Fetch Photos
    const { data: photos } = await supabase
        .from('photos')
        .select('*')
        .eq('court_id', id)
        .order('sort_order', { ascending: true });

    if (!court) notFound();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/pro/dashboard/listings" className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
                    <p className="text-sm text-gray-500">Updating {court.name}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 sm:p-8">
                    <EditListingForm court={court} />
                </div>
            </div>

            {/* Photo Manager Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <PhotoManager
                        courtId={id}
                        businessId={validClaim.business_id}
                        existingPhotos={photos || []}
                    />
                </div>
            </div>

        </div>
    )
}

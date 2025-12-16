
import { createClient } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { updateCourtDetails } from './actions'
import { PhotoManager } from './photo-manager'
import { ArrowLeft, Save } from 'lucide-react'

// Helper for Submit Button
function SubmitButton() {
    return (
        <button
            type="submit"
            className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
    )
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?next=/pro/dashboard/listings/${id}`);
    }

    // 1. Fetch Court & Validate Ownership
    // We check valid claims for this user
    const { data: claim } = await supabase
        .from('claims')
        .select('*, business:businesses(*)')
        .eq('court_id', id)
        .eq('status', 'verified')
        .filter('business.owner_user_id', 'eq', user.id) // Filter by user ownership
        .single();

    // Note: Supabase nested filtering can be tricky.
    // A better way often is: fetch claims -> check JS.
    // Or fetch business first, then claim.
    // Let's rely on row level security or manual check if filtered helper fails.

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
                    <form action={updateCourtDetails.bind(null, id)} className="space-y-8">

                        {/* Basic Info Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        defaultValue={court.description || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                        placeholder="Describe your venue, atmosphere, and amenities..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                                    <select
                                        name="indoor_outdoor"
                                        defaultValue={court.indoor_outdoor}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                    >
                                        <option value="indoor">Indoor</option>
                                        <option value="outdoor">Outdoor</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Court Count</label>
                                    <input
                                        type="number"
                                        name="court_count"
                                        defaultValue={court.court_count || 1}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Surface Type</label>
                                    <input
                                        type="text"
                                        name="surface"
                                        defaultValue={court.surface || ''}
                                        placeholder="e.g. Concrete, Acrylic"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                    />
                                </div>

                                <div className="flex items-center h-full pt-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="lights"
                                            defaultChecked={court.lights}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Has Lights?</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Public Website</label>
                                    <input
                                        type="url"
                                        name="public_website"
                                        defaultValue={court.public_website || ''}
                                        placeholder="https://..."
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Public Phone</label>
                                    <input
                                        type="tel"
                                        name="public_phone"
                                        defaultValue={court.public_phone || ''}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <SubmitButton />
                        </div>
                    </form>
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

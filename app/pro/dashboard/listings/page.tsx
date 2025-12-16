
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Edit, MapPin } from 'lucide-react'

export default async function ListingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch user's business/courts
    const { data: businesses } = await supabase
        .from('businesses')
        .select('*, courts(*)')
        .eq('owner_user_id', user?.id);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                <Link
                    href="/search?claim=true"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4 mr-2" /> Claim Another Court
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {businesses?.map((business: any) => (
                        <li key={business.id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <MapPin className="w-6 h-6 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-primary truncate">
                                                {business.courts?.name || business.business_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {business.city}, {business.region}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-shrink-0 ml-2">
                                        <Link
                                            href={`/court/${business.courts?.id}`}
                                            className="inline-flex mr-2 items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                        >
                                            View Public
                                        </Link>
                                        <Link
                                            href={`/pro/dashboard/listings/${business.courts?.id}`}
                                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-primary hover:bg-primary/90 focus:outline-none"
                                        >
                                            <Edit className="w-3 h-3 mr-1" /> Edit
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                    {(!businesses || businesses.length === 0) && (
                        <li className="px-4 py-12 text-center text-gray-500">
                            No listings found. Claim a court to get started.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}

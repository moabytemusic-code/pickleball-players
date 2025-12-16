import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { Search, MapPin, Edit2, CheckCircle, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminCourtsPage({ searchParams }: { searchParams: { q?: string, page?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const query = searchParams.q || '';
    const page = parseInt(searchParams.page || '1');
    const pageSize = 20;

    let dbQuery = supabase
        .from('courts')
        .select('*', { count: 'exact' });

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`);
    } else {
        // Default to showing unnamed or recent
        // dbQuery = dbQuery.ilike('name', '%Unnamed%'); 
        // actually showing all is better
    }

    const { data: courts, count, error } = await dbQuery
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    return (
        <div className="">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Court Manager</h1>
                    <p className="text-gray-500">View and edit court details.</p>
                </div>
                <Link href="/admin/courts/new" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 hidden">
                    Add Court
                </Link>
            </div>

            {/* Search */}
            <form className="mb-6 flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Filter</button>
            </form>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {courts?.map((court) => (
                            <tr key={court.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="ml-0">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{court.name}</div>
                                            <div className="text-xs text-gray-500">{court.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{court.city}</div>
                                    <div className="text-sm text-gray-500">{court.region}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${court.is_claimed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {court.is_claimed ? 'Claimed' : 'Unclaimed'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <Link href={`/admin/courts/${court.id}`} className="text-primary hover:text-green-900 flex items-center gap-1 font-medium">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!courts || courts.length === 0) && (
                    <div className="p-12 text-center text-gray-500">No courts found.</div>
                )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Page {page}
                </div>
                <div className="flex gap-2">
                    {page > 1 && (
                        <Link href={`?q=${query}&page=${page - 1}`} className="px-3 py-1 bg-white border rounded hover:bg-gray-50">Prev</Link>
                    )}
                    <Link href={`?q=${query}&page=${page + 1}`} className="px-3 py-1 bg-white border rounded hover:bg-gray-50">Next</Link>
                </div>
            </div>
        </div>
    );
}

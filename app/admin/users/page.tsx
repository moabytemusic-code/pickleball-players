import { createClient } from "@/lib/supabase-server";
import { Navbar } from "@/components/navbar";
import { Search, User, Shield, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const query = searchParams.q || '';

    let dbQuery = supabase
        .from('profiles')
        .select('*');

    if (query) {
        dbQuery = dbQuery.ilike('email', `%${query}%`);
    }

    const { data: users, error } = await dbQuery.order('created_at', { ascending: false }).limit(50);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">View registered users.</p>
                </div>
            </div>

            {error && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6 flex items-start gap-3">
                    <AlertTriangle className="text-orange-500 w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-800">Setup Required</h4>
                        <p className="text-sm text-orange-700">The <code>profiles</code> table is missing or not accessible. Please apply <code>database/profiles.sql</code> to your Supabase project.</p>
                    </div>
                </div>
            )}

            {/* Search */}
            <form className="mb-6 flex gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Filter</button>
            </form>

            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users?.map((u: any) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3">
                                            {u.email?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{u.email || 'No Email'}</div>
                                            <div className="text-xs text-gray-500">{u.full_name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                        {u.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(u.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                                    {u.id}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!users || users.length === 0) && !error && (
                    <div className="p-12 text-center text-gray-500">No users found.</div>
                )}
            </div>
        </div>
    );
}

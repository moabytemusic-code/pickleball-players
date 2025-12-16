'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '../../actions'; // Adjust path to admin actions
import { Loader2, Save } from 'lucide-react';

export function EditUserForm({ user }: { user: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const [formData, setFormData] = useState({
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        role: user.app_metadata?.role || 'user',
        sub_roles: user.app_metadata?.sub_roles || [],
        password: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        setErr("");

        const updates: any = {
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            sub_roles: formData.sub_roles
        };
        if (formData.password) updates.password = formData.password;

        const res = await updateUserProfile(user.id, updates);

        if (res?.error) {
            setErr(res.error);
        } else {
            setMsg("User profile updated successfully!");
            // Optional: Refresh data
            router.refresh();
        }
        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identity */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                />
            </div>

            {/* Profile */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Role */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner (Legacy)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Controls general access level.</p>
            </div>

            {/* Sub Roles / Capabilities */}
            {formData.role === 'admin' && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Capabilities</label>
                    <div className="space-y-2">
                        {['can_verify', 'can_edit_content', 'can_manage_users'].map((cap) => (
                            <label key={cap} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.sub_roles.includes(cap)}
                                    onChange={(e) => {
                                        const newRoles = e.target.checked
                                            ? [...formData.sub_roles, cap]
                                            : formData.sub_roles.filter((r: string) => r !== cap);
                                        setFormData({ ...formData, sub_roles: newRoles });
                                    }}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700 font-mono">{cap}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Password Reset */}
            <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700">Reset Password (Optional)</label>
                <input
                    type="password"
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">Leave blank to keep current password.</p>
            </div>

            {/* Feedback */}
            {err && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{err}</div>}
            {msg && <div className="text-green-500 text-sm bg-green-50 p-2 rounded">{msg}</div>}

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </button>
            </div>
        </form>
    );
}

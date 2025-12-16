'use client';

import { useState } from 'react';
import { MoreHorizontal, Loader2, Shield, Trash } from 'lucide-react';
import { updateUserRole, deleteUser } from '../actions';

export function UserActions({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    async function handleRoleUpdate() {
        setLoading(true);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        await updateUserRole(userId, newRole);
        setLoading(false);
        setIsOpen(false);
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        setLoading(true);
        await deleteUser(userId);
        setLoading(false);
        setIsOpen(false);
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
            >
                <MoreHorizontal size={20} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden">
                        <button
                            onClick={handleRoleUpdate}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Shield size={16} />
                            {loading ? 'Updating...' : (currentRole === 'admin' ? 'Remove Admin' : 'Make Admin')}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                        >
                            <Trash size={16} />
                            {loading ? 'Deleting...' : 'Delete User'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

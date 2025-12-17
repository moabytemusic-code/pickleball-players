'use client'

import { useState } from 'react'
import { cancelEvent, publishEvent, deleteEvent } from './actions'
import { useRouter } from 'next/navigation'
import { Loader2, Trash, Ban, CheckCircle } from 'lucide-react'

export function EventActions({ eventId, isActive }: { eventId: string, isActive: boolean }) {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();

    const handleToggleStatus = async () => {
        const action = isActive ? 'cancel' : 'publish';
        if (action === 'cancel' && !confirm('Are you sure you want to cancel this event? New users wont be able to register.')) return;

        setLoading(action);
        const fn = isActive ? cancelEvent : publishEvent;
        const res = await fn(eventId);

        if (res?.error) {
            alert(res.error);
        } else {
            router.refresh();
        }
        setLoading(null);
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to DELETE this event? This cannot be undone.')) return;

        setLoading('delete');
        const res = await deleteEvent(eventId);

        // If delete successful, server action redirects, but if it returns (error), we handle it.
        // The server action 'deleteEvent' in our code throws a redirect if successful? 
        // No, I removed the redirect from the try block because checkOwnership prevents simple implementation. 
        // Wait, I didn't put redirect in the code above? 
        // Ah, in 'actions.ts', 'deleteEvent' function ends with 'revalidatePath'. 
        // I need to add 'redirect' call *after* success in the client? or in the server?
        // In the server action provided in previous step, 'deleteEvent' does NOT have 'redirect'.
        // I should have put it there. 
        // Client side redirect is fine too.

        if (res?.error) {
            alert(res.error);
            setLoading(null);
        } else {
            router.push('/pro/dashboard/events');
        }
    }

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleToggleStatus}
                disabled={!!loading}
                className={`inline-flex items-center px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none ${isActive
                        ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        : 'border-transparent text-white bg-green-600 hover:bg-green-700'
                    }`}
            >
                {loading === (isActive ? 'cancel' : 'publish') ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isActive ? (
                    <Ban className="w-4 h-4 mr-2" />
                ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isActive ? 'Cancel Event' : 'Publish Event'}
            </button>

            <button
                onClick={handleDelete}
                disabled={!!loading}
                className="inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none"
            >
                {loading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
            </button>
        </div>
    )
}

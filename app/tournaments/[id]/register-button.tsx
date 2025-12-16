'use client'

import { useState } from 'react'
import { registerForEvent, cancelRegistration } from './actions'
import { Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function RegisterButton({
    eventId,
    isRegistered,
    className = ""
}: {
    eventId: string,
    isRegistered: boolean,
    className?: string
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRegister() {
        setLoading(true);
        const res = await registerForEvent(eventId);
        if (res.error) {
            alert(res.error);
        }
        setLoading(false);
    }

    async function handleCancel() {
        if (!confirm("Are you sure you want to cancel your registration?")) return;
        setLoading(true);
        const res = await cancelRegistration(eventId);
        if (res.error) {
            alert(res.error);
        }
        setLoading(false);
    }

    if (isRegistered) {
        return (
            <button
                onClick={handleCancel}
                disabled={loading}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700 border border-green-200 hover:border-red-200 ${className}`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {loading ? "Processing..." : "Registered (Click to Undo)"}
            </button>
        )
    }

    return (
        <button
            onClick={handleRegister}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform active:scale-95 bg-primary hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Register Now"}
        </button>
    )
}

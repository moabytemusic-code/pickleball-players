'use client'

import { useState } from 'react'
import { submitClaim } from './actions'
import { Loader2, CheckCircle } from 'lucide-react'

export function ClaimForm({ courtId }: { courtId: string }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [isDone, setIsDone] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const res = await submitClaim(courtId, formData);

        if (res?.error) {
            setError(res.error);
        } else {
            setIsDone(true);
            setMsg("Claim submitted! We will review your request within 24-48 hours.");
        }
        setLoading(false);
    }

    if (isDone) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Claim Received</h3>
                <p className="mt-1 text-sm text-gray-500">{msg}</p>
                <div className="mt-6">
                    <a href={`/court/${courtId}`} className="text-sm font-semibold text-primary hover:text-primary/80">
                        &larr; Back to Court
                    </a>
                </div>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium leading-6 text-foreground">
                    Business / Organization Name
                </label>
                <div className="mt-2">
                    <input
                        type="text"
                        name="business_name"
                        required
                        placeholder="e.g. Austin Parks & Rec, or private LLC"
                        className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium leading-6 text-foreground">
                        Contact Name
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="contact_name"
                            required
                            className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label className="block text-sm font-medium leading-6 text-foreground">
                        Phone Number
                    </label>
                    <div className="mt-2">
                        <input
                            type="tel"
                            name="contact_phone"
                            className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-foreground">
                    Verification Notes (Optional)
                </label>
                <div className="mt-2">
                    <textarea
                        name="notes"
                        rows={3}
                        placeholder="Tell us how we can verify you own this court (e.g. website link, utility bill, etc)."
                        className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 pl-2"
                    />
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Submit Claim"}
                </button>
            </div>
        </form>
    )
}

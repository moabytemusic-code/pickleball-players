'use client'

import { useState } from 'react'
import { createEvent } from './actions'
import { Loader2, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EventForm({ courtId }: { courtId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");

        const res = await createEvent(courtId, formData);

        if (res?.error) {
            setError(res.error);
            setLoading(false);
        } else {
            // Redirect back to court
            router.push(`/court/${courtId}`);
            router.refresh(); // Ensure new event shows
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Event Title</label>
                <input type="text" name="title" required className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6" placeholder="e.g. Saturday Morning Round Robin" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Date</label>
                    <input type="date" name="date" required className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6" />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Start Time</label>
                    <input type="time" name="time" required className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Duration (Hours)</label>
                    <input type="number" name="duration" step="0.5" defaultValue="2" className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6" />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Type</label>
                    <select name="kind" className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white">
                        <option value="open_play">Open Play</option>
                        <option value="social">Social</option>
                        <option value="tournament">Tournament</option>
                        <option value="clinic">Clinic</option>
                        <option value="league">League</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Cost ($)</label>
                    <input type="number" name="cost" step="0.01" min="0" placeholder="0.00" className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6" />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Skill Level</label>
                    <select name="skill" className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white">
                        <option value="">Any Level</option>
                        <option value="Beginner (1.0-2.5)">Beginner (1.0-2.5)</option>
                        <option value="intermediate (3.0-3.5)">Intermediate (3.0-3.5)</option>
                        <option value="Advanced (4.0+)">Advanced (4.0+)</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="w-full flex justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : "Create Event"}
            </button>
        </form>
    )
}

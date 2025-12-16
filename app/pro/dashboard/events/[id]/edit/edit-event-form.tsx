
'use client'

import { useState } from 'react'
import { updateEvent } from './actions'
import { Loader2, Calendar, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function EditEventForm({ event }: { event: any }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // Parse initial values for inputs
    const startDate = new Date(event.starts_at);
    // Adjust for local input requirement? 
    // Actually, ISO strings are UTC. The user expects to see local time or the time they set?
    // Let's assume the server stores UTC. We should convert to local for the input "value".
    // Or simplified: `starts_at` is usually displayed in local time.
    // Date input: YYYY-MM-DD
    const dateStr = startDate.toISOString().split('T')[0];
    // Time input: HH:MM
    // Note: toLocaleTimeString might include AM/PM, <input type="time"> needs 24hr format HH:MM.
    // Getting correct HH:MM from Date object:
    const hours = startDate.getHours().toString().padStart(2, '0');
    const minutes = startDate.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    // Duration
    const endDate = event.ends_at ? new Date(event.ends_at) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    const costDollars = (event.cost_cents || 0) / 100;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError("");
        setSuccess("");

        const res = await updateEvent(event.id, formData);

        if (res?.error) {
            setError(res.error);
        } else {
            setSuccess("Event updated successfully!");
            router.refresh(); // Refresh current page (if we stay here) or dashboard
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Event Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    defaultValue={event.title}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                />
            </div>

            <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Description</label>
                <textarea
                    name="description"
                    rows={3}
                    defaultValue={event.description || ''}
                    className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Date</label>
                    <input
                        type="date"
                        name="date"
                        required
                        defaultValue={dateStr}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Start Time</label>
                    <input
                        type="time"
                        name="time"
                        required
                        defaultValue={timeStr}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Duration (Hours)</label>
                    <input
                        type="number"
                        name="duration"
                        step="0.5"
                        defaultValue={durationHours}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Type</label>
                    <select
                        name="kind"
                        defaultValue={event.event_kind}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white"
                    >
                        <option value="open_play">Open Play</option>
                        <option value="social">Social</option>
                        <option value="tournament">Tournament</option>
                        <option value="clinic">Clinic</option>
                        <option value="league">League</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Cost ($)</label>
                    <input
                        type="number"
                        name="cost"
                        step="0.01"
                        min="0"
                        defaultValue={costDollars}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium leading-6 text-foreground">Skill Level</label>
                    <select
                        name="skill"
                        defaultValue={event.skill_level || ''}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white"
                    >
                        <option value="">Any Level</option>
                        <option value="Beginner (1.0-2.5)">Beginner (1.0-2.5)</option>
                        <option value="Intermediate (3.0-3.5)">Intermediate (3.0-3.5)</option>
                        <option value="Advanced (4.0+)">Advanced (4.0+)</option>
                    </select>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

            <div className="flex justify-end pt-4">
                <button type="submit" disabled={loading} className="flex justify-center items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}

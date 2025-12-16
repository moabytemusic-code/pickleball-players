
'use client'

import { useState } from 'react'
import { updateCourtDetails } from './actions'
import { Save, Loader2 } from 'lucide-react'

export function EditListingForm({ court }: { court: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);
        setError(null);

        const res = await updateCourtDetails(court.id, formData);

        if (res?.error) {
            setError(res.error);
        } else if (res?.success) {
            setMessage("Changes saved successfully!");
        }

        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Venue Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            defaultValue={court.description || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-black"
                            placeholder="Describe your venue, atmosphere, and amenities..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Environment</label>
                        <select
                            name="indoor_outdoor"
                            defaultValue={court.indoor_outdoor}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 bg-white text-black"
                        >
                            <option value="indoor">Indoor</option>
                            <option value="outdoor">Outdoor</option>
                            <option value="both">Both</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Court Count</label>
                        <input
                            type="number"
                            name="court_count"
                            defaultValue={court.court_count || 1}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Surface Type</label>
                        <input
                            type="text"
                            name="surface"
                            defaultValue={court.surface || ''}
                            placeholder="e.g. Concrete, Acrylic"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-black"
                        />
                    </div>

                    <div className="flex items-center h-full pt-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="lights"
                                defaultChecked={court.lights}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Has Lights?</span>
                        </label>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Contact Info */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Public Website</label>
                        <input
                            type="url"
                            name="public_website"
                            defaultValue={court.public_website || ''}
                            placeholder="https://..."
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Public Phone</label>
                        <input
                            type="tel"
                            name="public_phone"
                            defaultValue={court.public_phone || ''}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2 text-black"
                        />
                    </div>
                </div>
            </div>

            {(message || error) && (
                <div className={`text-sm text-center font-medium ${error ? 'text-red-500' : 'text-green-600'}`}>
                    {error || message}
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}

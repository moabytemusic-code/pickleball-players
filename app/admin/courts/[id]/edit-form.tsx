'use client'

import { useState } from "react";
import { updateCourt, addPhoto, deletePhoto } from "../../actions";
import { ArrowLeft, Save, Trash2, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditForm({ court, photos }: { court: any, photos: any[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // Local state for immediate feedback
    const [formData, setFormData] = useState({
        name: court.name,
        city: court.city,
        region: court.region,
        description: court.description || '',
        latitude: court.latitude || '',
        longitude: court.longitude || '',
        website: court.public_website || ''
    });

    const [newPhotoUrl, setNewPhotoUrl] = useState("");

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const res = await updateCourt(court.id, {
                name: formData.name,
                city: formData.city,
                region: formData.region,
                description: formData.description,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                public_website: formData.website
            });

            if (res?.error) {
                alert("Error: " + res.error);
            } else {
                setMsg("Saved successfully!");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save");
        }
        setLoading(false);
    }

    async function handleAddPhoto() {
        if (!newPhotoUrl) return;
        setLoading(true);
        await addPhoto(court.id, newPhotoUrl);
        setNewPhotoUrl("");
        router.refresh(); // Refresh to see new photo (server action revalidates)
        setLoading(false);
    }

    async function handleDeletePhoto(id: string) {
        if (!confirm("Delete this photo?")) return;
        setLoading(true);
        await deletePhoto(id, court.id);
        router.refresh();
        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/admin/courts" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courts
            </Link>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Edit Court: {court.name}</h1>
                {msg && <span className="text-green-600 font-medium animate-pulse">{msg}</span>}
                <a href={`/court/${court.id}`} target="_blank" className="text-primary hover:underline flex items-center text-sm">
                    View Public Page <ExternalLink className="w-3 h-3 ml-1" />
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Court Name</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Region (State)</label>
                                <input
                                    value={formData.region}
                                    onChange={e => setFormData({ ...formData, region: e.target.value })}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.latitude}
                                    onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.longitude}
                                    onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                    className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Website URL</label>
                            <input
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-green-700 shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Photos */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                        <h3 className="tex-lg font-bold text-gray-900 mb-4">Photos</h3>

                        <div className="space-y-4 mb-6">
                            {photos.map(p => (
                                <div key={p.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center">
                                    <img src={p.url} alt="Court" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => handleDeletePhoto(p.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {photos.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-8 bg-gray-50 rounded-lg">No photos yet</div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Add New Photo</label>
                            <div className="flex gap-2">
                                <input
                                    placeholder="https://..."
                                    value={newPhotoUrl}
                                    onChange={e => setNewPhotoUrl(e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 text-sm p-2 bg-gray-50 border focus:bg-white transition-colors"
                                />
                                <button
                                    onClick={handleAddPhoto}
                                    disabled={!newPhotoUrl || loading}
                                    className="p-2 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-50"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Paste a direct image URL.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

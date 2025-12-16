
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { saveUploadedPhoto, deletePhoto, setPrimaryPhoto } from './actions'
import { Loader2, Trash2, Star, Upload } from 'lucide-react'

export function PhotoManager({ courtId, businessId, existingPhotos }: { courtId: string, businessId: string, existingPhotos: any[] }) {
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${courtId}/${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('court-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('court-images')
                .getPublicUrl(filePath);

            // 3. Save to DB
            const res = await saveUploadedPhoto(courtId, publicUrl, businessId);
            if (res?.error) throw new Error(res.error);

        } catch (error: any) {
            console.error('Upload failed', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Photos</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img src={photo.url} alt="Court" className="w-full h-full object-cover" />

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                onClick={() => setPrimaryPhoto(photo.id, courtId)}
                                className={`p-1.5 rounded-full ${photo.is_primary ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                title="Set Primary"
                            >
                                <Star className={`w-4 h-4 ${photo.is_primary ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => deletePhoto(photo.id, courtId)}
                                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-red-500/80 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {photo.is_primary && (
                            <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded shadow-sm text-yellow-900">
                                Cover
                            </div>
                        )}
                    </div>
                ))}

                {/* Upload Button */}
                <div className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-primary">
                    {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 mb-2" />
                            <span className="text-sm font-medium">Add Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500">Max 10 photos. Supported formats: JPG, PNG.</p>
        </div>
    )
}

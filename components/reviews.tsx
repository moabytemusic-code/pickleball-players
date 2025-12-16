'use client'

import { useState } from 'react'
import { Star, Loader2, User as UserIcon } from 'lucide-react'
import { submitReview } from '@/app/court/[id]/actions'
import { cn } from '@/lib/utils'

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string; // usually we join profile to get name, but standard auth might not have metadata set up yet.
}

export function ReviewsSection({ courtId, initialReviews, userId }: { courtId: string, initialReviews: Review[], userId?: string }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Optimistic UI updates could happen here, but we rely on revalidatePath for simplicity

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await submitReview(courtId, rating, comment);

        if (res?.error) {
            setError(res.error);
        } else {
            setSuccess(true);
            setComment("");
        }
        setLoading(false);
    }

    if (success) {
        return (
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-200 dark:border-green-800">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Thanks for your review!</h3>
                <p className="text-green-700 dark:text-green-400">Your feedback helps the community.</p>
                <button onClick={() => setSuccess(false)} className="mt-4 text-sm underline text-green-600">Write another?</button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Community Reviews ({initialReviews.length})</h2>

            <div className="space-y-6">
                {initialReviews.length === 0 ? (
                    <p className="text-muted-foreground italic">No reviews yet. Be the first!</p>
                ) : (
                    initialReviews.map((review) => (
                        <div key={review.id} className="bg-card p-4 rounded-xl border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={cn("w-4 h-4", s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                                    ))}
                                </div>
                                <span className="text-xs text-muted-foreground ml-auto">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-foreground">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>

            {userId ? (
                <div className="bg-muted/30 p-6 rounded-xl border border-border mt-8">
                    <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRating(s)}
                                        className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                        <Star className={cn("w-8 h-8", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                placeholder="How are the courts? Is it crowded?"
                            />
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Review
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-muted/30 p-6 rounded-xl border border-border text-center">
                    <p className="text-muted-foreground mb-4">Log in to leave a review.</p>
                    <a href="/login" className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                        Log in
                    </a>
                </div>
            )}
        </div>
    )
}

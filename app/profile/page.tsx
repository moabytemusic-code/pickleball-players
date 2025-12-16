import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { MapPin, Star, Trash2, Calendar } from "lucide-react";
import { deleteReview } from "./actions";

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user reviews with court details
    // Note: 'courts' is the table name, Supabase infers the relationship
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
            *,
            courts (
                id,
                name,
                city,
                region
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                        {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Your Profile</h1>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Sidebar Stats */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                            <h3 className="font-semibold text-lg mb-4">Stats</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Reviews Posted</div>
                                    <div className="text-2xl font-bold">{reviews?.length || 0}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground">Member Since</div>
                                    <div className="text-foreground font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Activity */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>

                        {reviews && reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="bg-card rounded-xl p-6 border border-border shadow-sm group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-foreground text-lg hover:text-primary transition-colors">
                                                    <a href={`/court/${review.courts.id}`}>{review.courts.name}</a>
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {review.courts.city}, {review.courts.region}
                                                </div>
                                            </div>
                                            <form action={async () => {
                                                'use server';
                                                await deleteReview(review.id);
                                            }}>
                                                <button type="submit" className="text-muted-foreground hover:text-red-500 transition-colors p-2" title="Delete Review">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>

                                        <div className="flex items-center gap-1 mt-4">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                            ))}
                                            <span className="text-xs text-muted-foreground ml-2">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-foreground/90">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-secondary/30 rounded-xl border border-dashed border-border">
                                <p className="text-muted-foreground">You haven't posted any reviews yet.</p>
                                <a href="/search" className="text-primary hover:underline mt-2 inline-block font-medium">Find a court to review</a>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

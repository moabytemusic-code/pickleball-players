
'use client'

import { createClient } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, Check, ExternalLink } from 'lucide-react'

// Make sure to use the PUBLISHABLE key here
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function fetchSub() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Get Business for User
            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_user_id', user.id)
                .single();

            if (business) {
                // 2. Get Subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('business_id', business.id)
                    .single();

                setSubscription(sub);
            }
            setLoading(false);
        }
        fetchSub();
    }, [supabase]);

    async function handleSubscribe() {
        setActionLoading(true);
        try {
            const response = await fetch('/api/create-pro-checkout', {
                method: 'POST',
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || response.statusText);
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    }

    async function handlePortal() {
        setActionLoading(true);
        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Failed to open portal");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) return <div><Loader2 className="animate-spin" /></div>;

    const isPro = subscription && subscription.status === 'active';

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
            <p className="text-gray-500 mb-8">Manage your plan and payment methods.</p>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Pro Plan</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {isPro ? "You are currently subscribed to Pro." : "Upgrade to unlock all features."}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">$11.99</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-8">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">What's Included</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Verified Badge",
                                "Analytics Dashboard",
                                "Event Management",
                                "Priority Support",
                                "Up to 10 Photos",
                                "Zero Ads on Listing"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                    <Check className="w-4 h-4 text-green-500" /> {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    {isPro ? (
                        <button
                            onClick={handlePortal}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Manage Subscription
                        </button>
                    ) : (
                        <button
                            onClick={handleSubscribe}
                            disabled={actionLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                        >
                            {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Upgrade to Pro
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

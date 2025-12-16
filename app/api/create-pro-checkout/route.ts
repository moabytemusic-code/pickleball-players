
import { createClient } from '@/lib/supabase-server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Get Business info
    const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_user_id', user.id)
        .single();

    if (!business) {
        // In a real flow, force them to claim/create business first
        return new NextResponse("No business found", { status: 400 });
    }

    // 2. Create Stripe Checkout Session for Subscription
    if (!process.env.STRIPE_PRO_PRICE_ID) {
        console.error("Missing STRIPE_PRO_PRICE_ID");
        return new NextResponse("Server Configuration Error: Missing Price ID", { status: 500 });
    }

    // 3. Determine Base URL (Env Var or Request Origin)
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
        return new NextResponse("Server Configuration Error: Missing Base URL", { status: 500 });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PRICE_ID, // Defined in .env
                    quantity: 1,
                },
            ],
            customer_email: user.email,
            metadata: {
                userId: user.id,
                businessId: business.id,
                type: 'pro_subscription'
            },
            subscription_data: {
                metadata: {
                    businessId: business.id
                }
            },
            success_url: `${origin}/pro/dashboard/subscription?success=true`,
            cancel_url: `${origin}/pro/dashboard/subscription?canceled=true`,
        });

        return NextResponse.json({ url: session.url });
    } catch (e: any) {
        console.error(e);
        return new NextResponse(e.message, { status: 500 });
    }
}

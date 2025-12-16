
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
        return new NextResponse("No business found", { status: 400 });
    }

    // 2. Get existing subscription
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('business_id', business.id)
        .single();

    if (!subscription || !subscription.stripe_customer_id) {
        return new NextResponse("No subscription/customer found", { status: 400 });
    }

    // 3. Determine Base URL
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    if (!origin) {
        return new NextResponse("Server Configuration Error: Missing Base URL", { status: 500 });
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: subscription.stripe_customer_id,
            return_url: `${origin}/pro/dashboard/subscription`,
        });

        return NextResponse.json({ url: session.url });
    } catch (e: any) {
        console.error(e);
        return new NextResponse(e.message, { status: 500 });
    }
}

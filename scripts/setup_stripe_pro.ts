
// Step 1: Create a Product in Stripe Dashboard
// Step 2: Create a Price for that Product ($11.99/mo)
// Step 3: Add the Price ID to .env.local as STRIPE_PRO_PRICE_ID
//
// This script will verify that ID exists.

import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: any = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) envVars[k.trim()] = v.trim().replace(/"/g, '');
});

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY, { typescript: true });

(async () => {
    if (!envVars.STRIPE_PRO_PRICE_ID) {
        console.error("❌ STRIPE_PRO_PRICE_ID is missing in .env.local");

        // Optional: Create it automatically?
        console.log("Creating Pro Plan Product...");
        const product = await stripe.products.create({
            name: 'Pickleball Pro Membership',
            description: 'Verified badge, analytics, and event management.',
        });

        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 1199,
            currency: 'usd',
            recurring: { interval: 'month' },
        });

        console.log(`✅ Created Product: ${product.id}`);
        console.log(`✅ Created Price: ${price.id}`);
        console.log(`\n⬇️  ADD THIS TO .env.local  ⬇️`);
        console.log(`STRIPE_PRO_PRICE_ID=${price.id}`);
    } else {
        try {
            const price = await stripe.prices.retrieve(envVars.STRIPE_PRO_PRICE_ID);
            console.log(`✅ Found Price: ${price.id} (${price.unit_amount! / 100} ${price.currency})`);
        } catch (e) {
            console.error("❌ Invalid Price ID in .env.local");
        }
    }
})();

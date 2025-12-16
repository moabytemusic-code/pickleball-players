
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: any = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) envVars[k.trim()] = v.trim().replace(/"/g, '');
});

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
    console.log("Creating 'court-images' bucket...");

    // 1. Create Bucket
    const { data, error } = await supabase.storage.createBucket('court-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log("✅ Bucket 'court-images' already exists.");
        } else {
            console.error("❌ Failed to create bucket:", error.message);
            return;
        }
    } else {
        console.log("✅ Bucket 'court-images' created.");
    }

    // Note: Creating RLS policies via JS client is NOT supported by Supabase.
    // The bucket creation with `public: true` usually allows public reads.
    // However, INSERT permissions default to 'none' or typically require policies.

    // FOR DEV: We can rely on the fact that if we use the *client* with a token, 
    // we need policies. If we simply rely on the Service Role for uploads (which we aren't, 
    // we are using client-side upload in the UI), we NEED the SQL policies.

    console.log("\n⚠️  IMPORTANT: You must run `database/storage_migration.sql` in your Supabase SQL Editor.");
    console.log("   The JS client cannot create RLS policies for Storage.");
}

run();

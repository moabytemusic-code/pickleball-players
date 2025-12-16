
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env: Record<string, string> = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
            }
        });
        return env;
    } catch (e) {
        console.error("Could not read .env.local");
        return process.env;
    }
}

const env = loadEnv();

async function debugCourts() {
    const sbUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!sbUrl || !sbKey) {
        console.error("Missing env vars (URL/KEY)");
        console.log("URL:", sbUrl ? "Found" : "Missing");
        console.log("Key:", sbKey ? "Found" : "Missing");
        return;
    }

    const supabase = createClient(sbUrl, sbKey);

    console.log("Fetching courts...");
    const { data, error } = await supabase
        .from('courts')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Found", data?.length, "courts");
        data?.forEach((c, i) => {
            console.log(`[${i}] ID: '${c.id}' Type: ${typeof c.id} Name: ${c.name}`);
        });
    }
}

debugCourts();

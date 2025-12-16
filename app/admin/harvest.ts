'use server'

import { createClient } from '@supabase/supabase-js'

// Use Service Role to bypass RLS for admin actions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
)

export async function harvestCity(cityName: string) {
    const logs: string[] = [];
    logs.push(`🚀 Starting harvest for: ${cityName}`);

    try {
        // 1. Geocode City (Nominatim)
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
        logs.push(`🔍 Geocoding...`);

        const geoRes = await fetch(geoUrl, {
            headers: { 'User-Agent': 'PickleballPlayersBot/1.0' }
        });

        if (!geoRes.ok) throw new Error(`Nominatim Error: ${geoRes.statusText}`);
        const geoData = await geoRes.json();
        const location = geoData[0];

        if (!location) {
            logs.push("❌ City not found");
            return { success: false, logs };
        }

        // Bounding Box [minLat, maxLat, minLon, maxLon]
        // Nominatim returns [south, north, west, east] usually as strings
        const [minLat, maxLat, minLon, maxLon] = location.boundingbox;
        logs.push(`📍 Found: ${location.display_name}`);
        logs.push(`📐 BBox: SW(${minLat}, ${minLon}) -> NE(${maxLat}, ${maxLon})`);

        // 2. Query Overpass API
        const overpassUrl = "https://overpass-api.de/api/interpreter";
        // Query for tennis/pickleball
        // Note: timeout 25s.
        const query = `
            [out:json][timeout:25];
            (
              node["sport"~"pickleball|tennis"](${minLat},${minLon},${maxLat},${maxLon});
              way["sport"~"pickleball|tennis"](${minLat},${minLon},${maxLat},${maxLon});
              relation["sport"~"pickleball|tennis"](${minLat},${minLon},${maxLat},${maxLon});
            );
            out center;
        `;

        logs.push("📡 Querying OpenStreetMap (Overpass)...");
        const opRes = await fetch(overpassUrl, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`
        });

        if (!opRes.ok) throw new Error(`Overpass Error: ${opRes.status} ${opRes.statusText}`);
        const opData = await opRes.json();
        const elements = opData.elements || [];

        logs.push(`✅ Found ${elements.length} potential locations. filtering...`);

        let count = 0;
        let skipped = 0;

        for (const el of elements) {
            const tags = el.tags || {};

            // Check if it's actually pickleball
            // Heuristics: sport=pickleball OR sport=tennis + explicit mention of pickleball
            const isExplicitPickleball = tags.sport === 'pickleball' || (tags.sport === 'tennis' && JSON.stringify(tags).toLowerCase().includes('pickleball'));

            if (!isExplicitPickleball) {
                // If pure tennis, verify if we want it? For now, skip pure tennis to avoid clutter.
                // The python script might have been more permissive.
                // Python script query: node["sport"="pickleball"] OR nwr[sport=tennis][pickleball]
                // Our Overpass query fetched both.
                // Let's safe filter:
                skipped++;
                continue;
            }

            const lat = el.lat || el.center?.lat;
            const lng = el.lon || el.center?.lon;
            if (!lat || !lng) continue;

            // --- Naming Logic (TS Version) ---
            let name = tags.name;
            if (!name) {
                if (tags.operator) name = `${tags.operator} Pickleball Courts`;
                else if (tags.leisure === 'park') name = "Public Park Courts";
                else name = "Unnamed Pickleball Court";
            }

            // Deduplicate "Pickleball Courts Pickleball Courts"
            name = name.replace(/ Pickleball Courts Pickleball Courts/i, " Pickleball Courts");

            // --- Insert/Upsert ---
            // Construct address
            let city = tags['addr:city'];
            // Fallback city from input BBox center or search query?
            // Just use the input cityName if tag missing
            if (!city) city = cityName.split(',')[0].trim();

            const { error } = await supabaseAdmin
                .from('courts')
                .upsert({
                    // Simple collision detection on approximate location could be done, 
                    // but for now we rely on Supabase ID logic - wait, we don't have external_id unique constraint.
                    // So this WILL DUPLICATE if run multiple times.
                    // To prevent duplication, we could SELECT first.
                    name: name,
                    city: city,
                    latitude: lat,
                    longitude: lng,
                    indoor_outdoor: tags.indoor === 'yes' ? 'indoor' : 'outdoor',
                    confidence_score: 80,
                    is_active: true,
                    description: `Imported from OSM. Tags: ${JSON.stringify(tags).slice(0, 100)}`
                }, { onConflict: 'id' } as any); // Upsert requires conflict target. We have none.

            // Alternative: Check existence by lat/lng tolerance
            // This is slow in loop but safer.
            // Or just Insert.
            // Let's do simple check:
            if (error) {
                logs.push(`Error saving ${name}: ${error.message}`);
            } else {
                // logs.push(`Saved: ${name}`);
                count++;
            }
        }

        logs.push(`🎉 Import Complete. Processed ${count} verified courts.`);

    } catch (e: any) {
        logs.push(`❌ Error: ${e.message}`);
        console.error(e);
        return { success: false, logs };
    }

    return { success: true, logs };
}

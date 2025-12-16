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

        logs.push(`✅ Found ${elements.length} potential locations. Processing...`);

        let count = 0;
        let skipped = 0;

        for (const el of elements) {
            const tags = el.tags || {};
            const isExplicitPickleball = tags.sport === 'pickleball' || (tags.sport === 'tennis' && JSON.stringify(tags).toLowerCase().includes('pickleball'));

            if (!isExplicitPickleball) {
                skipped++;
                continue;
            }

            const lat = el.lat || el.center?.lat;
            const lng = el.lon || el.center?.lon;
            if (!lat || !lng) continue;

            let finalName = tags.name;
            let finalAddress = tags['addr:full'] || tags['addr:street'] ? `${tags['addr:street'] || ''} ${tags['addr:city'] || ''}` : '';
            let finalCity = tags['addr:city'];

            if (!finalName) {
                const geoData = await reverseGeocode(lat, lng);
                if (geoData) {
                    if (geoData.placeName) finalName = `${geoData.placeName} Pickleball Courts`;
                    if (!finalCity) finalCity = geoData.city;
                    if (!finalAddress) finalAddress = geoData.fullAddress;
                }
            }

            // Fallbacks
            if (!finalName) finalName = tags.operator ? `${tags.operator} Pickleball Courts` : "Unnamed Pickleball Court";
            if (!finalCity) finalCity = cityName.split(',')[0].trim();

            // Check for duplicates in DB based on Lat/Lng proximity (0.0001 deg ~= 11 meters)
            const { data: existing } = await supabaseAdmin.rpc('find_court_by_location', {
                lat: lat,
                lng: lng
            });

            // Use UPSERT logic manually since we don't have constraints
            let op;
            if (existing && existing.length > 0) {
                // Update existing
                logs.push(`🔄 Updating info for: ${finalName}`);
                op = supabaseAdmin.from('courts').update({
                    name: finalName,
                    city: finalCity,
                    description: `Imported from OSM (Updated). Addr: ${finalAddress}. Tags: ${JSON.stringify(tags).slice(0, 100)}`
                }).eq('id', existing[0].id);
            } else {
                // Insert new
                logs.push(`✨ New Court: ${finalName}`);
                op = supabaseAdmin.from('courts').insert({
                    name: finalName,
                    city: finalCity,
                    latitude: lat,
                    longitude: lng,
                    indoor_outdoor: tags.indoor === 'yes' ? 'indoor' : 'outdoor',
                    confidence_score: 90,
                    is_active: true,
                    description: `Imported from OSM. Addr: ${finalAddress}`
                });
            }

            const { error } = await op;

            if (error) {
                logs.push(`⚠️ DB Error: ${error.message}`);
            } else {
                count++;
            }
        }

        logs.push(`🎉 Import Complete. Processed ${count} courts.`);
    } catch (e: any) {
        logs.push(`❌ Error: ${e.message}`);
        console.error(e);
        return { success: false, logs };
    }

    return { success: true, logs };
}

export async function refineAllCourts() {
    const logs: string[] = [];
    logs.push("🚀 Starting Refinement Process...");

    try {
        // 1. Find candidates (Unnamed, or generic names like "Court on...")
        const { data: candidates, error } = await supabaseAdmin
            .from('courts')
            .select('*')
            .or('name.ilike.Unnamed Pickleball Court%,name.ilike.Court on%,name.ilike.Public Park Courts%,name.ilike.%Tennis Court%');

        if (error) throw error;
        if (!candidates || candidates.length === 0) {
            logs.push("✅ No generic-named courts found to refine.");
            return { success: true, logs };
        }

        logs.push(`found ${candidates.length} unnamed courts. Processing... (This will take ${candidates.length * 1.5} seconds)`);

        let updated = 0;
        for (const court of candidates) {
            const geoData = await reverseGeocode(court.latitude, court.longitude);

            if (geoData && geoData.placeName) {
                const newName = `${geoData.placeName} Pickleball Courts`;

                if (newName !== court.name) {
                    await supabaseAdmin.from('courts').update({
                        name: newName,
                        city: geoData.city || court.city,
                        description: court.description + ` | Refined Addr: ${geoData.fullAddress}`
                    }).eq('id', court.id);

                    logs.push(`✅ Renamed [${court.id.slice(0, 4)}]: ${newName}`);
                    updated++;
                } else {
                    logs.push(`⚠️ Could not find better name for [${court.id.slice(0, 4)}]`);
                }
            } else {
                logs.push(`❌ Rev-Geocode failed for ID ${court.id.slice(0, 4)}`);
            }
        }

        logs.push(`🎉 Refinement Complete. Updated ${updated} courts.`);

    } catch (e: any) {
        logs.push(`❌ Error: ${e.message}`);
    }

    return { success: true, logs };
}

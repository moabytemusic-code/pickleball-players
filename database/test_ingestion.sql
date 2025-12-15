-- =========================
-- TEST: INGESTION LOGIC
-- =========================

-- 1. Ensure a dummy source exists
insert into sources (id, name, source_type, base_url)
values (
  '11111111-1111-1111-1111-111111111111',
  'Austin Parks Test Source',
  'municipal',
  'https://austintexas.gov'
)
on conflict (id) do nothing;

-- 2. Call the Upsert RPC
select public.upsert_court_from_scrape(
  '{
    "source_id": "11111111-1111-1111-1111-111111111111",
    "external_id": "austin-parks-98765",
    "source_url": "https://example.gov/parks/pickleball/98765",
    "name": "Zilker Park Pickleball Courts",
    "address1": "2100 Barton Springs Rd",
    "city": "Austin",
    "region": "TX",
    "postal_code": "78704",
    "country": "US",
    "latitude": 30.2669,
    "longitude": -97.7729,
    "indoor_outdoor": "outdoor",
    "court_count": 8,
    "surface": "sport court",
    "lights": true,
    "access_type": "public",
    "public_website": "https://austintexas.gov",
    "confidence_score": 85,
    "needs_review": false
  }'::jsonb
);

-- 3. Validation
-- select * from courts where name = 'Zilker Park Pickleball Courts';

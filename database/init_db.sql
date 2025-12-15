-- =========================
-- PickleballPlayers.app Schema (Postgres / Supabase)
-- =========================
-- Notes:
-- - Uses UUID PKs
-- - Designed for: unclaimed -> claim -> pro
-- - Events are first-class objects
-- - Analytics aggregated daily
-- - Leads captured from listing contact form (Pro)
-- =========================

-- Extensions (Supabase typically has these available)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists postgis;
create extension if not exists pg_trgm;

-- -------------------------
-- ENUMS
-- -------------------------
do $$ begin
  create type court_access_type as enum ('public', 'private', 'paid', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type indoor_outdoor_type as enum ('indoor', 'outdoor', 'both', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type claim_status_type as enum ('pending', 'verified', 'rejected', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_type as enum ('open_play', 'tournament', 'league', 'clinic', 'lesson', 'social', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status_type as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid');
exception when duplicate_object then null; end $$;

-- -------------------------
-- CORE: COURTS
-- -------------------------
create table if not exists courts (
  id uuid primary key default gen_random_uuid(),

  -- Identity
  name text not null,
  description text,

  -- Location
  address1 text,
  address2 text,
  city text,
  region text,          -- state/province
  postal_code text,
  country text,         -- 'US' or 'CA' ideally
  latitude double precision,
  longitude double precision,

  -- Attributes
  indoor_outdoor indoor_outdoor_type not null default 'unknown',
  court_count int,
  surface text,         -- e.g., 'asphalt', 'concrete', 'sport court'
  lights boolean,
  access_type court_access_type not null default 'unknown',

  -- Listing state
  is_active boolean not null default true,
  is_claimed boolean not null default false,
  verified_badge boolean not null default false, -- “verified court” display flag (typically when claim verified)

  -- Contact (public-facing; can be overridden by business profile)
  public_website text,
  public_phone text,
  public_email text,

  -- Data quality / ops
  confidence_score int not null default 0, -- 0-100
  needs_review boolean not null default false,
  duplicate_group_id uuid, -- optional: link near-duplicate clusters

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists idx_courts_city_region on courts (city, region);
create index if not exists idx_courts_country_region on courts (country, region);
create index if not exists idx_courts_claimed on courts (is_claimed);
create index if not exists idx_courts_confidence on courts (confidence_score desc);

-- Simple geo index using composite (works for many apps)
create index if not exists idx_courts_lat_lng on courts (latitude, longitude);

-- Keep updated_at fresh
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_courts_updated_at on courts;
create trigger trg_courts_updated_at
before update on courts
for each row execute procedure set_updated_at();

-- -------------------------
-- DATA SOURCES + INGESTION
-- -------------------------
create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,            -- e.g., "City of Austin Parks", "Google Maps", "USAP directory"
  source_type text not null,     -- e.g., 'municipal', 'directory', 'maps', 'club_site'
  base_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists court_sources (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  source_url text,               -- exact page/dataset entry
  external_id text,              -- id from the source (if any)
  last_seen_at timestamptz,
  field_map jsonb,               -- raw -> normalized mapping notes
  raw_payload jsonb,             -- optional raw data snapshot (keep light)
  created_at timestamptz not null default now()
);

create index if not exists idx_court_sources_court on court_sources (court_id);
create index if not exists idx_court_sources_source on court_sources (source_id);

-- -------------------------
-- BUSINESSES (PRO OWNERS / FACILITIES)
-- -------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),

  -- Supabase Auth user id (business account)
  owner_user_id uuid, -- references auth.users(id) in Supabase; leave as uuid for portability

  business_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,

  website text,
  booking_url text,

  -- Branding
  logo_url text,
  description text,

  -- Address (optional; court has address too)
  address1 text,
  address2 text,
  city text,
  region text,
  postal_code text,
  country text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_businesses_owner on businesses (owner_user_id);

drop trigger if exists trg_businesses_updated_at on businesses;
create trigger trg_businesses_updated_at
before update on businesses
for each row execute procedure set_updated_at();

-- -------------------------
-- CLAIMS (LINK BUSINESS <-> COURT)
-- -------------------------
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,

  status claim_status_type not null default 'pending',

  -- verification
  verification_method text,     -- e.g., 'email_domain', 'phone_sms', 'manual_review'
  verification_notes text,
  verified_at timestamptz,

  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (court_id, business_id)
);

create index if not exists idx_claims_court on claims (court_id);
create index if not exists idx_claims_business on claims (business_id);
create index if not exists idx_claims_status on claims (status);

drop trigger if exists trg_claims_updated_at on claims;
create trigger trg_claims_updated_at
before update on claims
for each row execute procedure set_updated_at();

-- Convenience: single “active claim” per court (optional enforcement)
-- You can enforce via partial unique index on verified claims:
create unique index if not exists uq_claims_one_verified_per_court
on claims (court_id)
where status = 'verified';

-- -------------------------
-- AMENITIES (NORMALIZED)
-- -------------------------
create table if not exists amenities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,     -- e.g., 'lessons', 'leagues', 'tournaments', 'pro_shop', 'rentals'
  label text not null,
  created_at timestamptz not null default now()
);

create table if not exists court_amenities (
  court_id uuid not null references courts(id) on delete cascade,
  amenity_id uuid not null references amenities(id) on delete cascade,
  value text, -- optional details, e.g. "Mon/Wed evenings", "Ball machine available"
  created_at timestamptz not null default now(),
  primary key (court_id, amenity_id)
);

-- -------------------------
-- PHOTOS (COURT GALLERY)
-- -------------------------
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null, -- photo owner (pro)
  url text not null,
  caption text,
  sort_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_photos_court on photos (court_id);
create index if not exists idx_photos_business on photos (business_id);

-- Ensure only one primary photo per court (optional)
create unique index if not exists uq_photos_one_primary_per_court
on photos (court_id)
where is_primary = true;

-- -------------------------
-- EVENTS (PRO FEATURE)
-- -------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null, -- created by verified owner typically

  event_kind event_type not null default 'other',
  title text not null,
  description text,

  starts_at timestamptz not null,
  ends_at timestamptz,

  skill_level text,        -- e.g., "Beginner", "3.0-3.5", etc.
  cost_cents int,          -- store money as cents; null means free/unknown
  currency text default 'USD',

  registration_url text,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_court_time on events (court_id, starts_at);
create index if not exists idx_events_active_time on events (is_active, starts_at);

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at
before update on events
for each row execute procedure set_updated_at();

-- -------------------------
-- ANALYTICS (DAILY AGGREGATES)
-- -------------------------
create table if not exists analytics_daily (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,

  day date not null,
  profile_views int not null default 0,
  directions_clicks int not null default 0,
  website_clicks int not null default 0,
  booking_clicks int not null default 0,
  call_clicks int not null default 0,
  email_clicks int not null default 0,
  event_views int not null default 0,
  leads int not null default 0,

  created_at timestamptz not null default now(),
  unique (court_id, day)
);

create index if not exists idx_analytics_daily_court_day on analytics_daily (court_id, day);

-- -------------------------
-- LEADS (PRO LISTING CONTACT FORM)
-- -------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,

  -- lead info
  name text,
  email text,
  phone text,
  message text,

  -- context
  source text, -- e.g., 'listing_contact_form'
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_business_created on leads (business_id, created_at desc);

-- -------------------------
-- SUBSCRIPTIONS / ENTITLEMENTS (STRIPE)
-- -------------------------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,

  provider text not null default 'stripe',
  status subscription_status_type not null default 'trialing',

  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,

  -- Pro perks counters
  geo_pushes_remaining int not null default 1,
  geo_push_reset_day date, -- set monthly reset date

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (business_id)
);

create index if not exists idx_subscriptions_status on subscriptions (status);
create index if not exists idx_subscriptions_stripe_sub on subscriptions (stripe_subscription_id);

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at
before update on subscriptions
for each row execute procedure set_updated_at();

-- -------------------------
-- OPTIONAL: GEO PUSH LOG (PRO FEATURE)
-- -------------------------
create table if not exists geo_push_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  court_id uuid references courts(id) on delete set null,

  title text not null,
  message text not null,
  radius_miles int not null default 10,
  sent_at timestamptz not null default now(),

  created_at timestamptz not null default now()
);

create index if not exists idx_geo_push_log_business on geo_push_log (business_id, sent_at desc);

-- =========================
-- BUSINESS LOGIC TRIGGERS
-- =========================

create or replace function public.enforce_max_court_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  photo_count int;
begin
  select count(*) into photo_count
  from photos
  where court_id = new.court_id;

  if photo_count >= 10 then
    raise exception 'Maximum of 10 photos allowed per court';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_max_court_photos on public.photos;

create trigger trg_enforce_max_court_photos
before insert on public.photos
for each row
execute procedure public.enforce_max_court_photos();

-- =========================
-- GEOGRAPHIC SETUP
-- =========================

-- Add Geography column (PostGIS)
alter table public.courts
add column if not exists geog geography(point, 4326);

-- Index for distance queries
create index if not exists idx_courts_geog on courts using gist (geog);

-- Backfill from existing lat/lng (User Request)
update public.courts
set geog = case
  when latitude is not null and longitude is not null
    then st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  else null
end
where geog is null;

-- Trigger to keep geog in sync automatically
create or replace function public.maintain_court_geog()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.geog := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  else
    new.geog := null;
  end if;
  return new;
end;
$$;

create trigger trg_maintain_court_geog
before insert or update of latitude, longitude on courts
for each row execute procedure maintain_court_geog();

-- =========================
-- HOURS & AVAILABILITY
-- =========================
alter table public.courts
add column if not exists hours_json jsonb;  -- e.g., {"mon":"7-9", ...}

alter table public.courts
add column if not exists typical_busy_times jsonb; -- later, inferred from usage/events

-- =========================
-- SEARCH OPTIMIZATION
-- =========================
-- Geo radius queries (Ensure specific name)
create index if not exists idx_courts_geog_gist
on public.courts using gist (geog);

-- Name similarity matching
create index if not exists idx_courts_name_trgm
on public.courts using gin (name gin_trgm_ops);

-- Address similarity matching (optional but useful)
create index if not exists idx_courts_address1_trgm
on public.courts using gin (address1 gin_trgm_ops);

-- =========================
-- DUPLICATE TRACKING
-- =========================
create table if not exists public.duplicate_groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  note text
);

create table if not exists public.duplicate_group_members (
  duplicate_group_id uuid not null references public.duplicate_groups(id) on delete cascade,
  court_id uuid not null references public.courts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (duplicate_group_id, court_id)
);
-- =========================
-- INGESTION HELPERS
-- =========================

-- Ensure unique constraint exists for upsert
alter table court_sources
add constraint uq_court_sources_court_source unique (court_id, source_id);

create or replace function public.upsert_court_from_scrape(p jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_court_id uuid;
  v_source_id uuid;
  v_external_id text;
  v_source_url text;

  v_name text;
  v_address1 text;
  v_city text;
  v_region text;
  v_country text;

  v_lat double precision;
  v_lng double precision;

  v_confidence int;
  v_needs_review boolean;

  v_matched_court_id uuid; -- Holds the original match if we decide not to merge
begin
  -- Required-ish fields
  v_source_id   := nullif(p->>'source_id','')::uuid;
  v_external_id := nullif(p->>'external_id','');
  v_source_url  := nullif(p->>'source_url','');

  v_name     := nullif(p->>'name','');
  v_address1 := nullif(p->>'address1','');
  v_city     := nullif(p->>'city','');
  v_region   := nullif(p->>'region','');
  v_country  := nullif(p->>'country','');

  v_lat := nullif(p->>'latitude','')::double precision;
  v_lng := nullif(p->>'longitude','')::double precision;

  v_confidence := coalesce(nullif(p->>'confidence_score','')::int, 0);
  v_needs_review := coalesce((p->>'needs_review')::boolean, false);

  if v_name is null then
    raise exception 'Missing required field: name';
  end if;

  -- 1) Try match by source_id + external_id (most reliable)
  if v_source_id is not null and v_external_id is not null then
    select cs.court_id into v_court_id
    from court_sources cs
    where cs.source_id = v_source_id
      and cs.external_id = v_external_id
    limit 1;
  end if;

  -- 2) Fallback match by normalised identity (name + address + city/region/country)
  -- Note: This is fuzzy. In production you might use PostGIS distance check too.
  if v_court_id is null then
    select c.id into v_court_id
    from courts c
    where lower(trim(c.name)) = lower(trim(v_name))
      and coalesce(lower(trim(c.address1)),'') = coalesce(lower(trim(v_address1)),'')
      and coalesce(lower(trim(c.city)),'') = coalesce(lower(trim(v_city)),'')
      and coalesce(lower(trim(c.region)),'') = coalesce(lower(trim(v_region)),'')
      and coalesce(lower(trim(c.country)),'') = coalesce(lower(trim(v_country)),'')
    limit 1;
  end if;

  -- 3) Geo-dedupe fallback (PostGIS) if still not found
  if v_court_id is null then
    v_court_id := public.find_duplicate_court(
      v_name,
      v_address1,
      v_lat,
      v_lng,
      v_city,
      v_region,
      v_country,
      75,     -- radius meters
      0.35    -- min name similarity
    );
  end if;

  -- --------------------------
  -- SAFE MERGE LOCK CHECK
  -- --------------------------
  if v_court_id is not null then
    if public.may_merge_into_court(v_court_id, v_confidence, 85) = false then
      -- Lock active! Do NOT merge. Create new record instead.
      v_matched_court_id := v_court_id; -- remember for grouping
      
      insert into courts (
        name, description,
        address1, address2, city, region, postal_code, country,
        latitude, longitude,
        indoor_outdoor, court_count, surface, lights, access_type,
        public_website, public_phone, public_email,
        confidence_score, needs_review,
        is_active
      )
      values (
        v_name,
        nullif(p->>'description',''),

        v_address1,
        nullif(p->>'address2',''),
        v_city,
        v_region,
        nullif(p->>'postal_code',''),
        v_country,

        v_lat, v_lng,

        coalesce(nullif(p->>'indoor_outdoor','')::indoor_outdoor_type, 'unknown'),
        nullif(p->>'court_count','')::int,
        nullif(p->>'surface',''),
        nullif(p->>'lights','')::boolean,
        coalesce(nullif(p->>'access_type','')::court_access_type, 'unknown'),

        nullif(p->>'public_website',''),
        nullif(p->>'public_phone',''),
        nullif(p->>'public_email',''),

        v_confidence,
        true,   -- Force needs_review
        true
      )
      returning id into v_court_id;

      -- Create Duplicate Group to link them for admin review
      perform public.create_duplicate_group(
        v_court_id,
        v_matched_court_id,
        'Auto-flagged: matched claimed court but merge locked (low confidence)'
      );

      -- We are done creating the court. Skip standard upsert block? 
      -- Ideally, we just fall through to source creation.
      -- To prevent the 'Update' block below, we just need to ensure we don't enter it.
      -- Currently the code below does: 'if v_court_id is null ... else update ...'
      -- Since v_court_id is now NEW, it will hit ELSE and run UPDATE. 
      -- That is redundant but safe (updates same values).
    end if;
  end if;

  -- Upsert into courts (Standard Path)
  -- Note: If we just created a new blocked record above, v_court_id is set, so we hit the ELSE.
  -- If we didn't match anything, v_court_id is null -> Insert.
  -- If we matched and ALLOWED merge, v_court_id is old -> Update.
  --
  -- The only edge case is: If we matched and Locked, v_court_id is NEW. We update it again here.
  -- Since it's new, it's not claimed, so the update logic just overwrites with same data. Safe.
  if v_court_id is null then
    insert into courts (
      name, description,
      address1, address2, city, region, postal_code, country,
      latitude, longitude,
      indoor_outdoor, court_count, surface, lights, access_type,
      public_website, public_phone, public_email,
      confidence_score, needs_review,
      is_active
    )
    values (
      v_name,
      nullif(p->>'description',''),

      v_address1,
      nullif(p->>'address2',''),
      v_city,
      v_region,
      nullif(p->>'postal_code',''),
      v_country,

      v_lat, v_lng,

      coalesce(nullif(p->>'indoor_outdoor','')::indoor_outdoor_type, 'unknown'),
      nullif(p->>'court_count','')::int,
      nullif(p->>'surface',''),
      nullif(p->>'lights','')::boolean,
      coalesce(nullif(p->>'access_type','')::court_access_type, 'unknown'),

      nullif(p->>'public_website',''),
      nullif(p->>'public_phone',''),
      nullif(p->>'public_email',''),

      v_confidence,
      v_needs_review,

      true
    )
    returning id into v_court_id;

  else
    -- Update strategy:
    -- - Never overwrite claimed/verified owner-edited fields too aggressively
    -- - Prefer filling NULLs; update confidence if higher; keep active
    update courts c
    set
      name = coalesce(nullif(p->>'name',''), c.name),
      description = coalesce(nullif(p->>'description',''), c.description),

      address1 = coalesce(nullif(p->>'address1',''), c.address1),
      address2 = coalesce(nullif(p->>'address2',''), c.address2),
      city     = coalesce(nullif(p->>'city',''), c.city),
      region   = coalesce(nullif(p->>'region',''), c.region),
      postal_code = coalesce(nullif(p->>'postal_code',''), c.postal_code),
      country  = coalesce(nullif(p->>'country',''), c.country),

      latitude  = coalesce(nullif(p->>'latitude','')::double precision, c.latitude),
      longitude = coalesce(nullif(p->>'longitude','')::double precision, c.longitude),

      -- Only update these if court is NOT claimed (owner data should win)
      indoor_outdoor = case when c.is_claimed then c.indoor_outdoor
                            else coalesce(nullif(p->>'indoor_outdoor','')::indoor_outdoor_type, c.indoor_outdoor) end,
      court_count    = case when c.is_claimed then c.court_count
                            else coalesce(nullif(p->>'court_count','')::int, c.court_count) end,
      surface        = case when c.is_claimed then c.surface
                            else coalesce(nullif(p->>'surface',''), c.surface) end,
      lights         = case when c.is_claimed then c.lights
                            else coalesce(nullif(p->>'lights','')::boolean, c.lights) end,
      access_type    = case when c.is_claimed then c.access_type
                            else coalesce(nullif(p->>'access_type','')::court_access_type, c.access_type) end,

      -- Contact fields: fill blanks; don't clobber existing
      public_website = coalesce(nullif(p->>'public_website',''), c.public_website),
      public_phone   = coalesce(nullif(p->>'public_phone',''), c.public_phone),
      public_email   = coalesce(nullif(p->>'public_email',''), c.public_email),

      -- Quality / ops
      confidence_score = greatest(c.confidence_score, v_confidence),
      needs_review = (c.needs_review or v_needs_review),
      is_active = true,

      updated_at = now()
    where c.id = v_court_id;
  end if;

  -- Upsert the court_sources record (if source_id provided)
  if v_source_id is not null then
    insert into court_sources (
      court_id, source_id, source_url, external_id, last_seen_at, raw_payload
    )
    values (
      v_court_id, v_source_id, v_source_url, v_external_id, now(), p
    )
    on conflict (court_id, source_id) do update
    set
      source_url = coalesce(excluded.source_url, court_sources.source_url),
      external_id = coalesce(excluded.external_id, court_sources.external_id),
      last_seen_at = now(),
      raw_payload = excluded.raw_payload;
  end if;

  return v_court_id;
end;
$$;

-- =========================
-- ADVANCED DEDUPLICATION
-- =========================

create or replace function public.find_duplicate_court(
  p_name text,
  p_address1 text,
  p_lat double precision,
  p_lng double precision,
  p_city text default null,
  p_region text default null,
  p_country text default null,
  p_radius_meters int default 75,        -- typical: 50–150
  p_min_name_sim real default 0.35       -- typical: 0.30–0.45
)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_geog geography(point,4326);
  v_match uuid;
begin
  if p_lat is null or p_lng is null then
    return null; -- no geo, no geo-dedupe
  end if;

  v_geog := st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography;

  -- Candidate search within radius; rank by score
  select c.id into v_match
  from public.courts c
  where c.is_active = true
    and c.geog is not null
    and st_dwithin(c.geog, v_geog, p_radius_meters)
    -- optional region/country narrowing if provided
    and (p_country is null or c.country = p_country)
    and (p_region  is null or c.region  = p_region)
    and (p_city    is null or c.city    = p_city)
    -- require at least some name similarity
    and similarity(lower(c.name), lower(p_name)) >= p_min_name_sim
  order by
    -- higher similarity first, then closer distance
    (similarity(lower(c.name), lower(p_name))
      + coalesce(similarity(lower(coalesce(c.address1,'')), lower(coalesce(p_address1,''))), 0) * 0.25
    ) desc,
    st_distance(c.geog, v_geog) asc
  limit 1;

  return v_match;
end;
$$;

-- =========================
-- DUPLICATE GROUP HELPER
-- =========================
create or replace function public.create_duplicate_group(p_court_a uuid, p_court_b uuid, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  g uuid;
begin
  insert into public.duplicate_groups(note) values (p_note) returning id into g;

  insert into public.duplicate_group_members(duplicate_group_id, court_id)
  values (g, p_court_a), (g, p_court_b)
  on conflict do nothing;

  update public.courts set duplicate_group_id = g where id in (p_court_a, p_court_b);

  return g;
end;
$$;

-- =========================
-- MERGE GUARD
-- =========================
create or replace function public.may_merge_into_court(
  p_target_court_id uuid,
  p_incoming_confidence int,
  p_conf_threshold int default 85
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      -- If verified badge is present, NEVER merge via scraper.
      when (select verified_badge from public.courts where id = p_target_court_id) = true then false
      
      -- If court is not claimed, merging is allowed
      when (select is_claimed from public.courts where id = p_target_court_id) = false then true

      -- If court is claimed (but not verified badge?), only allow merge when incoming confidence is high
      when (select is_claimed from public.courts where id = p_target_court_id) = true
        and p_incoming_confidence >= p_conf_threshold
      then true

      else false
    end;
$$;

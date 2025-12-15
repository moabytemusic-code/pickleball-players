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

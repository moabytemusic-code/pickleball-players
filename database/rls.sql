-- =========================
-- RLS HELPER FUNCTIONS
-- =========================

-- Helper: is the current user a VERIFIED owner of a given court?
create or replace function public.is_verified_court_owner(p_court_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from claims c
    join businesses b on b.id = c.business_id
    where c.court_id = p_court_id
      and c.status = 'verified'
      and b.owner_user_id = auth.uid()
  );
$$;

-- Helper: is the current user the owner of a business row?
create or replace function public.is_business_owner(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from businesses b
    where b.id = p_business_id
      and b.owner_user_id = auth.uid()
  );
$$;

-- Helper: is business currently Pro (trialing or active)?
create or replace function public.is_pro_business(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from subscriptions s
    where s.business_id = p_business_id
      and s.status in ('trialing', 'active')
  );
$$;

-- =========================
-- ENABLE RLS ON ALL TABLES
-- =========================
alter table public.courts enable row level security;
alter table public.sources enable row level security;
alter table public.court_sources enable row level security;

alter table public.businesses enable row level security;
alter table public.claims enable row level security;

alter table public.amenities enable row level security;
alter table public.court_amenities enable row level security;

alter table public.photos enable row level security;
alter table public.events enable row level security;

alter table public.analytics_daily enable row level security;
alter table public.leads enable row level security;

alter table public.subscriptions enable row level security;
alter table public.geo_push_log enable row level security;

-- =========================
-- POLICIES
-- =========================

-- COURTS
create policy "Public courts are viewable by everyone"
on courts for select
using ( is_active = true );

create policy "Verified owners can update their court"
on courts for update
using ( is_verified_court_owner(id) );

-- AMENITIES (Public Read)
create policy "Amenities: public read"
on amenities for select using (true);

-- COURT AMENITIES
-- Public can read court amenities (display badges)
create policy "Court amenities: public read"
on court_amenities for select using (true);

-- Verified owners can manage amenities for their court
create policy "Court amenities: verified owner insert"
on court_amenities for insert
with check (is_verified_court_owner(court_id));

create policy "Court amenities: verified owner update"
on court_amenities for update
using (is_verified_court_owner(court_id))
with check (is_verified_court_owner(court_id));

create policy "Court amenities: verified owner delete"
on court_amenities for delete
using (is_verified_court_owner(court_id));

-- SOURCES (Internal / Admin mostly - No public access)
-- No policies = no access via anon/authenticated.
-- Use service_role for ingestion pipelines and admin tools.

-- BUSINESSES
-- Owner can read their business profile
create policy "Businesses: owner read"
on businesses for select
using (owner_user_id = auth.uid());

-- Owner can create their business profile
create policy "Businesses: owner insert"
on businesses for insert
with check (owner_user_id = auth.uid());

-- Owner can update their business profile
create policy "Businesses: owner update"
on businesses for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

-- Optional: allow owner delete their business profile
create policy "Businesses: owner delete"
on businesses for delete
using (owner_user_id = auth.uid());

-- CLAIMS
-- Owner can read claims for their business
create policy "Claims: business owner read"
on claims for select
using (is_business_owner(business_id));

-- Owner can create a claim for their business (pending)
create policy "Claims: business owner insert"
on claims for insert
with check (
  is_business_owner(business_id)
  and status = 'pending'
);

-- Owner can update ONLY non-status fields while still pending (keeps status pending)
create policy "Claims: business owner update pending"
on claims for update
using (is_business_owner(business_id) and status = 'pending')
with check (is_business_owner(business_id) and status = 'pending');

-- Verification (status -> verified/rejected) should be done via service_role/admin only.

-- EVENTS
-- Public can read active events (for active courts)
create policy "Events: public read active"
on events for select
using (
  is_active = true
  and exists (select 1 from courts c where c.id = events.court_id and c.is_active = true)
);

-- Verified owners can manage events for their court
create policy "Events: verified owner insert"
on events for insert
with check (is_verified_court_owner(court_id));

create policy "Events: verified owner update"
on events for update
using (is_verified_court_owner(court_id))
with check (is_verified_court_owner(court_id));

create policy "Events: verified owner delete"
on events for delete
using (is_verified_court_owner(court_id));

-- PHOTOS
-- Public can read photos for active courts
create policy "Photos: public read"
on photos for select
using (
  exists (select 1 from courts c where c.id = photos.court_id and c.is_active = true)
);

-- Verified owners can manage photos for their court
create policy "Photos: verified owner insert"
on photos for insert
with check (is_verified_court_owner(court_id));

create policy "Photos: verified owner update"
on photos for update
using (is_verified_court_owner(court_id))
with check (is_verified_court_owner(court_id));

create policy "Photos: verified owner delete"
on photos for delete
using (is_verified_court_owner(court_id));

-- ANALYTICS (Private to Business Owner)
-- Owners can read their analytics (per court/business)
create policy "Analytics: owner read"
on analytics_daily for select
using (
  (business_id is not null and is_business_owner(business_id))
  or (is_verified_court_owner(court_id))
);

-- Writes should be via service_role / backend jobs (no public insert/update/delete).

-- LEADS (Private to Business Owner)
-- Anyone can submit a lead (contact form)
create policy "Leads: public insert"
on leads for insert
with check (true);

-- Business owners can read leads addressed to them
create policy "Leads: business owner read"
on leads for select
using (is_business_owner(business_id));

-- SUBSCRIPTIONS (Private to Owner)
-- Owner can read their subscription row
create policy "Subscriptions: owner read"
on subscriptions for select
using (is_business_owner(business_id));

-- Optional: owner can update cancellation preference flags (keep simple)
create policy "Subscriptions: owner update limited"
on subscriptions for update
using (is_business_owner(business_id))
with check (is_business_owner(business_id));

-- Inserts/real status updates should be via Stripe webhook using service_role.

-- GEO PUSH LOG (Private to Owner)
-- Owner can read their push history
create policy "Geo push: owner read"
on geo_push_log for select
using (is_business_owner(business_id));

-- Owner can create a push log entry only if Pro
create policy "Geo push: pro owner insert"
on geo_push_log for insert
with check (
  is_business_owner(business_id)
  and is_pro_business(business_id)
);

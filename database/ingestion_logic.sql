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

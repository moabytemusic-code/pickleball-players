-- =========================
-- EXAMPLE QUERIES
-- =========================

-- 1. Find Nearby Indoor Courts
-- (Parameters: :lng, :lat, :radius_meters)
select c.*
from courts c
where c.is_active = true
  and c.indoor_outdoor in ('indoor','both')
  and st_dwithin(
    c.geog,
    st_setsrid(st_makepoint(:lng, :lat), 4326)::geography,
    :radius_meters
  )
order by st_distance(
  c.geog,
  st_setsrid(st_makepoint(:lng, :lat), 4326)::geography
);

-- 2. Find Courts with 'Open Play' AND Lights
select distinct c.*
from courts c
join court_amenities ca on ca.court_id = c.id
join amenities a on a.id = ca.amenity_id
where c.is_active = true
  and a.slug = 'open_play'
  and c.lights = true
  and st_dwithin(
    c.geog,
    st_setsrid(st_makepoint(:lng, :lat), 4326)::geography,
    :radius_meters
  );

-- 3. Find Bookable Courts (Direct URL or Reservation Amenity)
select distinct c.*
from courts c
left join businesses b on b.id in (
  select cl.business_id from claims cl
  where cl.court_id = c.id and cl.status = 'verified'
)
left join court_amenities ca on ca.court_id = c.id
left join amenities a on a.id = ca.amenity_id
where c.is_active = true
  and (
    or a.slug = 'court_reservations'
  );

-- 4. Find Courts with Active Events in Next 7 Days
select distinct c.*
from courts c
join events e on e.court_id = c.id
where c.is_active = true
  and e.is_active = true
  and e.starts_at >= now()
  and e.starts_at < now() + interval '7 days';

-- 5. Find Tournaments This Week (Calendar Week)
select distinct c.*
from courts c
join events e on e.court_id = c.id
where c.is_active = true
  and e.event_kind = 'tournament'
  and e.starts_at >= date_trunc('week', now())
  and e.starts_at < date_trunc('week', now()) + interval '7 days';

-- 6. Find Beginner Friendly Courts (Lessons, Clinics, or Beginner Events)
select distinct c.*
from courts c
left join court_amenities ca on ca.court_id = c.id
left join amenities a on a.id = ca.amenity_id
left join events e on e.court_id = c.id
where c.is_active = true
  and (
    a.slug in ('lessons','clinics')
    or e.skill_level ilike '%beginner%'
  );

-- 7. Find Family Friendly Courts (Child Friendly + Basic Amenities)
select distinct c.*
from courts c
join court_amenities ca on ca.court_id = c.id
join amenities a on a.id = ca.amenity_id
where c.is_active = true
  and a.slug in ('child_friendly','restrooms','seating');

-- 8. Find Courts by Physical Attributes (Count & Surface)
-- (Parameters: :min_courts, :surface)
select c.*
from courts c
where c.is_active = true
  and c.court_count >= :min_courts
  and c.surface = :surface;

-- 9. Mega Filter (Indoor + Bookable + Events + Nearby)
select distinct c.*
from courts c
left join claims cl on cl.court_id = c.id and cl.status = 'verified'
left join businesses b on b.id = cl.business_id
left join court_amenities ca on ca.court_id = c.id
left join amenities a on a.id = ca.amenity_id
left join events e on e.court_id = c.id
where c.is_active = true
  and c.indoor_outdoor in ('indoor','both')
  and (
    b.booking_url is not null
    or a.slug = 'court_reservations'
  )
  and e.is_active = true
  and e.starts_at >= now()
  and st_dwithin(
    c.geog,
    st_setsrid(st_makepoint(:lng, :lat), 4326)::geography,
    :radius_meters
  );

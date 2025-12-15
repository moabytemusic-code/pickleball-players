-- =========================
-- STORAGE SETUP
-- =========================

-- Create a bucket for court photos
insert into storage.buckets (id, name, public)
values ('court-photos', 'court-photos', true)
on conflict (id) do nothing;

-- =========================
-- STORAGE HELPERS
-- =========================

-- Extract court_id from object path: courts/<court_id>/<file>
create or replace function public.court_id_from_object_name(object_name text)
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  parts text[];
  cid uuid;
begin
  parts := string_to_array(object_name, '/');

  -- Require: courts/<uuid>/<file>
  if array_length(parts, 1) < 3 then
    return null;
  end if;

  if parts[1] <> 'courts' then
    return null;
  end if;

  begin
    cid := parts[2]::uuid;
  exception when others then
    return null;
  end;

  return cid;
end;
$$;

-- True if current user can manage this storage object (verified court owner)
create or replace function public.can_manage_court_photo(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_verified_court_owner(public.court_id_from_object_name(object_name));
$$;

-- =========================
-- STORAGE POLICIES (RLS on storage.objects)
-- =========================

alter table storage.objects enable row level security;

-- 1. Public Read (Anyone can view photos)
create policy "Court photos: public read"
on storage.objects
for select
using (bucket_id = 'court-photos');

-- 2. Verified Owner Upload (Insert)
create policy "Court photos: verified owner upload"
on storage.objects for insert
with check (
  bucket_id = 'court-photos'
  and auth.role() = 'authenticated'
  and public.can_manage_court_photo(name)
);

-- 3. Verified Owner Update (Replace)
create policy "Court photos: verified owner update"
on storage.objects for update
using (
  bucket_id = 'court-photos'
  and auth.role() = 'authenticated'
  and public.can_manage_court_photo(name)
)
with check (
  bucket_id = 'court-photos'
  and auth.role() = 'authenticated'
  and public.can_manage_court_photo(name)
);

-- 4. Verified Owner Delete
create policy "Court photos: verified owner delete"
on storage.objects for delete
using (
  bucket_id = 'court-photos'
  and auth.role() = 'authenticated'
  and public.can_manage_court_photo(name)
);

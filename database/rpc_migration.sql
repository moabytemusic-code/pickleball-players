-- Create RPC function to find courts by proximity
-- This helps prevent duplicates during data import
create or replace function find_court_by_location(lat float, lng float)
returns setof courts
language plpgsql
security definer
as $$
begin
  return query
  select *
  from courts
  where (latitude between lat - 0.001 and lat + 0.001)
    and (longitude between lng - 0.001 and lng + 0.001)
  limit 1;
end;
$$;

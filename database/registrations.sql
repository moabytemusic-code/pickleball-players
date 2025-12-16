create table if not exists event_registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'confirmed' check (status in ('confirmed', 'waitlist', 'cancelled')),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- RLS
alter table event_registrations enable row level security;

create policy "Users can view public registrations"
  on event_registrations for select
  using (true);

create policy "Users can register themselves"
  on event_registrations for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel their own registration"
  on event_registrations for delete
  using (auth.uid() = user_id);

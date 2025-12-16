-- Create Reviews Table
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references courts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (court_id, user_id)
);

create index if not exists idx_reviews_court on reviews(court_id);

-- Add RLS Policies so users can insert their own reviews
alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select
  using ( true );

create policy "Users can insert their own reviews"
  on reviews for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own reviews"
  on reviews for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own reviews"
  on reviews for delete
  using ( auth.uid() = user_id );


-- Create a new public bucket for court images
insert into storage.buckets (id, name, public)
values ('court-images', 'court-images', true)
on conflict (id) do nothing;

-- RLS Policy: Public can view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'court-images' );

-- RLS Policy: Authenticated users can upload court images
create policy "Authenticated Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'court-images' and auth.role() = 'authenticated' );

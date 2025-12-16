-- Add payment columns to registrations
alter table event_registrations 
add column if not exists payment_status text check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
add column if not exists stripe_session_id text,
add column if not exists amount_paid_cents integer default 0;

-- Default existing to 'paid' (legacy/free)
update event_registrations set payment_status = 'paid' where payment_status is null;

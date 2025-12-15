-- =========================
-- SEED DATA: AMENITIES
-- =========================

insert into amenities (slug, label) values
-- Core Play
('lessons', 'Lessons'),
('open_play', 'Open Play'),
('leagues', 'Leagues'),
('tournaments', 'Tournaments'),
('clinics', 'Clinics'),
('ladder_play', 'Ladder Play'),

-- Facility Features
('pro_shop', 'Pro Shop'),
('equipment_rental', 'Equipment Rental'),
('ball_machine', 'Ball Machine'),
('restrooms', 'Restrooms'),
('water_fountain', 'Water Fountain'),
('seating', 'Seating / Benches'),
('shade', 'Shade / Covered Areas'),
('lighting', 'Lighting (Night Play)'),
('indoor_courts', 'Indoor Courts'),
('outdoor_courts', 'Outdoor Courts'),

-- Services & Access
('court_reservations', 'Court Reservations'),
('drop_in_play', 'Drop-In Play'),
('membership_required', 'Membership Required'),
('guest_passes', 'Guest Passes Available'),
('private_events', 'Private Events'),
('coaching_available', 'Coaching Available'),

-- Extras
('food_beverage', 'Food & Beverage'),
('locker_rooms', 'Locker Rooms'),
('showers', 'Showers'),
('parking', 'Parking'),
('wheelchair_accessible', 'Wheelchair Accessible'),
('child_friendly', 'Child-Friendly'),
('senior_friendly', 'Senior-Friendly')
on conflict (slug) do nothing;

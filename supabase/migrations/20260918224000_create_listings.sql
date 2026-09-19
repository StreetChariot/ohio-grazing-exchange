-- Ohio Grazing Exchange listings.
-- First slice has no accounts, so anonymous clients may read and insert.
-- Updates and deletes are not granted. Tighten insert once auth exists.
-- Intended Supabase compute size is Micro. Do not apply this remotely until
-- the $10/month project cost is confirmed.

create extension if not exists pgcrypto;

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  side text not null check (side in ('land', 'livestock')),
  title text not null,
  county text not null,
  nearest_town text not null,
  latitude double precision not null,
  longitude double precision not null,
  land_type text check (land_type in ('pasture', 'cover_crop', 'crop_residue', 'woodland', 'other')),
  livestock_type text not null check (livestock_type in ('cattle', 'sheep', 'goats', 'horses', 'mixed', 'other')),
  seasons text[] not null,
  available_from date not null,
  available_until date not null,
  acres numeric(8, 1),
  head_count integer,
  travel_radius_miles integer,
  fencing text check (fencing in ('none', 'partial', 'perimeter')),
  water_available boolean,
  rate_notes text,
  description text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  created_at timestamptz not null default now(),
  constraint listings_dates_ok check (available_until >= available_from),
  constraint listings_seasons_ok check (
    cardinality(seasons) > 0
    and seasons <@ array['spring', 'summer', 'fall', 'winter']::text[]
  ),
  constraint listings_side_fields check (
    (
      side = 'land'
      and land_type is not null
      and acres is not null
      and acres > 0
    )
    or (
      side = 'livestock'
      and head_count is not null
      and head_count > 0
      and travel_radius_miles is not null
      and travel_radius_miles >= 0
    )
  )
);

create index listings_county_idx on public.listings (county);
create index listings_side_idx on public.listings (side);
create index listings_livestock_type_idx on public.listings (livestock_type);
create index listings_dates_idx on public.listings (available_from, available_until);

alter table public.listings enable row level security;

grant select, insert on public.listings to anon, authenticated;
grant select, insert, update, delete on public.listings to service_role;

create policy "listings are publicly readable"
  on public.listings
  for select
  to anon, authenticated
  using (true);

create policy "anyone can post a listing"
  on public.listings
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(title)) between 8 and 140
    and char_length(btrim(description)) between 20 and 4000
    and char_length(btrim(contact_name)) between 2 and 80
    and contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  );

insert into public.listings (
  id, side, title, county, nearest_town, latitude, longitude, land_type,
  livestock_type, seasons, available_from, available_until, acres, head_count,
  travel_radius_miles, fencing, water_available, rate_notes, description,
  contact_name, contact_email, contact_phone, created_at
) values
(
  'a1000000-0000-4000-8000-000000000001', 'land',
  '48 acres of mixed pasture south of Wooster', 'Wayne', 'Wooster',
  40.78, -81.94, 'pasture', 'cattle',
  array['spring', 'summer', 'fall'], '2026-05-01', '2026-10-31',
  48, null, null, 'perimeter', true,
  '$1.10 per cow-calf pair per day. Grazier handles daily moves.',
  'Fescue and clover pasture broken into four paddocks. A pond and a frost-free tank sit on the east line. Looking for a cattle producer who will move animals and leave residual cover, not a season-long set stock.',
  'Mara Ellison', 'mara.ellison@example.com', '(330) 555-0142',
  '2026-08-12T14:00:00Z'
),
(
  'a1000000-0000-4000-8000-000000000002', 'land',
  'Cereal rye after corn, 62 acres near Greenville', 'Darke', 'Greenville',
  40.1, -84.63, 'cover_crop', 'cattle',
  array['fall', 'winter', 'spring'], '2026-10-15', '2027-04-20',
  62, null, null, 'partial', true,
  '$0.75 per head per day if the grazier handles daily moves.',
  'Rye drilled after corn silage. One side has a woven-wire line; the rest needs polywire. Water is a hydrant at the lane. Cattle can start once the rye is tall enough to take a bite, usually mid-October, and stay into early spring.',
  'Dale Horst', 'dale.horst@example.com', '(937) 555-0188',
  '2026-08-20T15:10:00Z'
),
(
  'a1000000-0000-4000-8000-000000000003', 'land',
  'Corn residue on 110 acres west of London', 'Madison', 'London',
  39.89, -83.48, 'crop_residue', 'cattle',
  array['fall'], '2026-09-20', '2026-12-15',
  110, null, null, 'none', true,
  'Open to a per-head daily rate or a flat field fee.',
  'Combine finished mid-September. Stalks and some dropped ears. No permanent fence, so the grazier brings polywire and a water tank. A hydrant is at the field edge. Prefer dry cows or stockers that can leave before Christmas.',
  'Priya Nand', 'priya.nand@example.com', '(740) 555-0164',
  '2026-09-02T12:00:00Z'
),
(
  'a1000000-0000-4000-8000-000000000004', 'land',
  '18 acres of oak woods for goat browse', 'Athens', 'Athens',
  39.34, -82.1, 'woodland', 'goats',
  array['summer'], '2026-06-01', '2026-09-30',
  18, null, null, 'partial', true,
  'Brush control is the point. $0.40 per head per day, or a trade.',
  'South-facing oak woods with honeysuckle and multiflora rose on the edges. A creek runs the west line. Existing fence holds goats on two sides. Looking for a herd that will work the understory without ringing the trees.',
  'Jonah Hale', 'jonah.hale@example.com', '(740) 555-0119',
  '2026-05-18T16:20:00Z'
),
(
  'a1000000-0000-4000-8000-000000000005', 'land',
  '32-acre sheep pasture with interior paddocks', 'Seneca', 'Tiffin',
  41.12, -83.18, 'pasture', 'sheep',
  array['summer', 'fall'], '2026-05-15', '2026-09-30',
  32, null, null, 'perimeter', true,
  '$18 per ewe for the season, or a daily rate if the stay is shorter.',
  'Orchardgrass and clover, five interior paddocks, woven wire around the outside. Water troughs are already in. Guardian-dog friendly. No rams on the place, and the neighbor runs a small cattle herd across the road.',
  'Ellen Kruse', 'ellen.kruse@example.com', '(419) 555-0173',
  '2026-04-28T13:40:00Z'
),
(
  'a1000000-0000-4000-8000-000000000006', 'land',
  'Summer annuals after wheat, 40 acres', 'Putnam', 'Ottawa',
  41.02, -84.05, 'cover_crop', 'cattle',
  array['summer', 'fall'], '2026-08-01', '2026-11-15',
  40, null, null, 'none', true,
  'Rate is open. Prefer a grazier who plants nothing and brings fence.',
  'Sorghum-sudangrass and cowpeas seeded after wheat. Ready for cattle in August and still holding in September. No perimeter fence. Water from a hydrant on the north headland. Need the field clear before we put wheat back in.',
  'Chris Baum', 'chris.baum@example.com', '(419) 555-0190',
  '2026-07-22T11:05:00Z'
),
(
  'a1000000-0000-4000-8000-000000000007', 'livestock',
  '36 cow-calf pairs looking for winter cover crops', 'Holmes', 'Millersburg',
  40.55, -81.92, 'cover_crop', 'cattle',
  array['fall', 'winter'], '2026-11-01', '2027-03-31',
  null, 36, 40, null, null,
  'We can pay a daily per-pair rate and split seed cost on rye.',
  'Angus-cross pairs. We move cattle daily, haul our own polywire, and can set portable tanks if the field has a hydrant. Home place is south of Millersburg. Looking for cereal rye or a mixed cover within about 40 miles, November through March.',
  'Ruth Miller', 'ruth.miller@example.com', '(330) 555-0133',
  '2026-09-08T18:00:00Z'
),
(
  'a1000000-0000-4000-8000-000000000008', 'livestock',
  '90 ewes need spring forage near Circleville', 'Pickaway', 'Circleville',
  39.6, -82.95, 'pasture', 'sheep',
  array['spring'], '2027-03-20', '2027-06-10',
  null, 90, 30, null, null,
  'Happy to pay by the ewe or by the day. We supply net fence.',
  'Commercial ewes, lambs already off. We need grass from late March until breeding pastures at home recover. Will travel about 30 miles from Circleville. Electronet and a guardian dog come with the flock. Prefer a field with water and no loose dogs.',
  'Owen Brant', 'owen.brant@example.com', '(740) 555-0155',
  '2026-09-10T09:30:00Z'
),
(
  'a1000000-0000-4000-8000-000000000009', 'livestock',
  '22 meat goats for woodland or rough pasture', 'Brown', 'Georgetown',
  38.87, -83.9, 'woodland', 'goats',
  array['summer', 'fall'], '2026-06-01', '2026-09-30',
  null, 22, 45, null, null,
  'Brush work can offset part of the grazing fee.',
  'Kiko-cross does and kids. Good on honeysuckle, multiflora, and cedar edges. We haul portable panels and can stay through September if late browse is still there. Based in Georgetown and willing to drive about 45 miles.',
  'Lila Crowe', 'lila.crowe@example.com', '(937) 555-0127',
  '2026-09-14T20:15:00Z'
),
(
  'a1000000-0000-4000-8000-000000000010', 'livestock',
  '8 horses need summer pasture in Knox County', 'Knox', 'Mount Vernon',
  40.39, -82.49, 'pasture', 'horses',
  array['spring', 'summer', 'fall'], '2026-05-01', '2026-10-15',
  null, 8, 25, null, null,
  'Monthly board-style rate is fine. We check animals daily.',
  'Eight mature riding horses, easy keepers. Looking for shade, water, and a field that is not next to a busy road. We can bring portable fencing if the perimeter is weak. Stay is May through mid-October, within 25 miles of Mount Vernon.',
  'Sam Yeager', 'sam.yeager@example.com', '(740) 555-0108',
  '2026-09-16T13:00:00Z'
);

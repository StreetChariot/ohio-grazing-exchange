-- Demo feed-source (land) and grazer (livestock) listings for the states
-- that were missing from the original Ohio-only sample set.

insert into public.listings (
  id, side, title, state, county, nearest_town, latitude, longitude, land_type,
  livestock_type, seasons, available_from, available_until, acres, head_count,
  travel_radius_miles, fencing, water_available, rate_notes, description, created_at
) values
(
  'a1000000-0000-4000-8000-000000000011', 'land',
  '64 acres of grass east of New Holland', 'Pennsylvania', 'Lancaster', 'New Holland',
  40.1, -76.09, 'pasture', 'cattle',
  array['spring', 'summer', 'fall'], '2026-05-01', '2026-10-20',
  64, null, null, 'perimeter', true,
  '$1.00 per pair per day. Daily moves preferred.',
  'Orchardgrass and clover on rolling ground, already split into six paddocks. A spring-fed tank sits in the middle paddock. Looking for a cattle grazier who will leave residual and be off before we stockpile the last growth.',
  '2026-09-01T15:00:00Z'
),
(
  'a1000000-0000-4000-8000-000000000012', 'land',
  'Rye and triticale after corn near Williamsport', 'Pennsylvania', 'Lycoming', 'Williamsport',
  41.25, -77.02, 'cover_crop', 'cattle',
  array['fall', 'winter'], '2026-10-20', '2027-03-15',
  80, null, null, 'none', true,
  'Open to a daily head rate. Grazier brings fence.',
  'Cover drilled the week after silage chop. No perimeter fence. A hydrant is at the farm lane, and the field drains to a grassed waterway we want left alone. Cattle can start once the stand can take a bite and should be gone before spring tillage.',
  '2026-09-03T14:20:00Z'
),
(
  'a1000000-0000-4000-8000-000000000013', 'livestock',
  '28 cow-calf pairs based near Bellefonte', 'Pennsylvania', 'Centre', 'Bellefonte',
  40.91, -77.78, 'pasture', 'cattle',
  array['summer', 'fall'], '2026-06-15', '2026-10-31',
  null, 28, 50, null, null,
  'We pay a daily per-pair rate and handle the moves.',
  'Angus-cross pairs. We haul polywire and can set a portable tank if there is a hydrant. Home place is west of Bellefonte. Looking for pasture or a summer annual within about 50 miles, June through October.',
  '2026-09-04T16:10:00Z'
),
(
  'a1000000-0000-4000-8000-000000000014', 'livestock',
  '70 ewes looking for spring grass in Bradford County', 'Pennsylvania', 'Bradford', 'Towanda',
  41.74, -76.44, 'pasture', 'sheep',
  array['spring'], '2027-04-10', '2027-06-15',
  null, 70, 35, null, null,
  'By the ewe or by the day. We bring electronet.',
  'Commercial ewes, lambs already weaned by the time we would move. Need a field with water from mid-April until our hill pasture recovers. Guardian dog comes with the flock. Based in Towanda and willing to drive about 35 miles.',
  '2026-09-06T12:40:00Z'
),
(
  'a1000000-0000-4000-8000-000000000015', 'land',
  '40-acre horse pasture outside Paris', 'Kentucky', 'Bourbon', 'Paris',
  38.22, -84.24, 'pasture', 'horses',
  array['spring', 'summer', 'fall'], '2026-04-15', '2026-10-31',
  40, null, null, 'perimeter', true,
  'Monthly rate. We''d like the field rested in July if it burns up.',
  'Fenced bluegrass and fescue with a run-in shed and two automatic waterers. Shade along the creek. Suitable for a small horse herd that will not overgraze the slopes. No stallions.',
  '2026-08-28T13:15:00Z'
),
(
  'a1000000-0000-4000-8000-000000000016', 'land',
  'Corn stalks on 150 acres south of Hopkinsville', 'Kentucky', 'Christian', 'Hopkinsville',
  36.8, -87.49, 'crop_residue', 'cattle',
  array['fall', 'winter'], '2026-10-01', '2027-01-31',
  150, null, null, 'none', true,
  'Flat field fee or a per-head day rate. Either works.',
  'Harvest should finish late September. Stalks, some dropped grain, and a rye cover on half the field. No fence. Water is a hydrant at the grain bins. Prefer stockers that can leave before we spray in February.',
  '2026-09-07T17:05:00Z'
),
(
  'a1000000-0000-4000-8000-000000000017', 'livestock',
  '40 stockers seeking winter annuals near Glasgow', 'Kentucky', 'Barren', 'Glasgow',
  36.99, -85.91, 'cover_crop', 'cattle',
  array['fall', 'winter'], '2026-11-01', '2027-03-01',
  null, 40, 45, null, null,
  'We can pay daily and split the seed if the field still needs planting.',
  'Black yearlings, used to a daily move. We bring polywire and a water tank. Looking for cereal rye, triticale, or a mixed cover within about 45 miles of Glasgow, November through February.',
  '2026-09-09T11:25:00Z'
),
(
  'a1000000-0000-4000-8000-000000000018', 'livestock',
  '16 meat goats for brush near Campton', 'Kentucky', 'Wolfe', 'Campton',
  37.73, -83.55, 'woodland', 'goats',
  array['summer', 'fall'], '2026-06-01', '2026-09-15',
  null, 16, 40, null, null,
  'Brush control can count toward the fee.',
  'Kiko does, good on multiflora and honeysuckle. We haul portable panels and can stay through early September if the browse holds. Based in Campton and willing to drive about 40 miles.',
  '2026-09-11T19:00:00Z'
),
(
  'a1000000-0000-4000-8000-000000000019', 'land',
  '55 acres of hill pasture near Lewisburg', 'West Virginia', 'Greenbrier', 'Lewisburg',
  37.8, -80.45, 'pasture', 'cattle',
  array['spring', 'summer', 'fall'], '2026-05-10', '2026-10-15',
  55, null, null, 'partial', true,
  '$0.90 per pair per day if the grazier moves them.',
  'Fescue and clover on a south slope, with a spring at the bottom fence. Two sides are woven wire; the ridge needs polywire. Looking for cattle that will be moved, not set-stocked, and off before we stockpile October growth.',
  '2026-08-30T14:45:00Z'
),
(
  'a1000000-0000-4000-8000-000000000020', 'land',
  '22 acres of woods and edge for goat browse', 'West Virginia', 'Preston', 'Kingwood',
  39.47, -79.68, 'woodland', 'goats',
  array['summer'], '2026-06-15', '2026-08-31',
  22, null, null, 'partial', true,
  'The browse work matters more than the check. Rate is negotiable.',
  'Mixed hardwoods with autumn olive and multiflora on the old field edge. A creek crosses the lower corner. Fence holds on the road side. Looking for goats that will open the understory without barking the crop trees.',
  '2026-09-05T10:30:00Z'
),
(
  'a1000000-0000-4000-8000-000000000021', 'livestock',
  '18 pairs looking for river-bottom grass', 'West Virginia', 'Kanawha', 'Charleston',
  38.35, -81.63, 'pasture', 'cattle',
  array['summer', 'fall'], '2026-06-01', '2026-09-30',
  null, 18, 40, null, null,
  'Daily per-pair rate. We move the herd and check water.',
  'Crossbred pairs, quiet, used to polywire. Home place is west of Charleston. Looking for pasture with water within about 40 miles, June through September. We can start on a cover crop if the grass is short.',
  '2026-09-12T15:50:00Z'
),
(
  'a1000000-0000-4000-8000-000000000022', 'livestock',
  '45 ewes need fall forage near Romney', 'West Virginia', 'Hampshire', 'Romney',
  39.34, -78.76, 'pasture', 'sheep',
  array['fall'], '2026-09-15', '2026-11-30',
  null, 45, 30, null, null,
  'We pay by the day and bring net fence and a guardian dog.',
  'White-faced ewes coming off summer pasture. Need grass or a cover crop from mid-September until Thanksgiving, within about 30 miles of Romney. Prefer a field that is not next to a busy road.',
  '2026-09-15T18:20:00Z'
)
on conflict (id) do nothing;

insert into public.listing_contacts (listing_id, contact_name, contact_email, contact_phone)
values
  ('a1000000-0000-4000-8000-000000000011', 'Hannah Stoltzfus', 'hannah.stoltzfus@example.com', '(717) 555-0144'),
  ('a1000000-0000-4000-8000-000000000012', 'Paul Eberly', 'paul.eberly@example.com', '(570) 555-0182'),
  ('a1000000-0000-4000-8000-000000000013', 'Nora Kephart', 'nora.kephart@example.com', '(814) 555-0160'),
  ('a1000000-0000-4000-8000-000000000014', 'Edith Warren', 'edith.warren@example.com', '(570) 555-0116'),
  ('a1000000-0000-4000-8000-000000000015', 'Claire Bowman', 'claire.bowman@example.com', '(859) 555-0194'),
  ('a1000000-0000-4000-8000-000000000016', 'Marcus Pettit', 'marcus.pettit@example.com', '(270) 555-0177'),
  ('a1000000-0000-4000-8000-000000000017', 'June Harlow', 'june.harlow@example.com', '(270) 555-0138'),
  ('a1000000-0000-4000-8000-000000000018', 'Eli Combs', 'eli.combs@example.com', '(606) 555-0121'),
  ('a1000000-0000-4000-8000-000000000019', 'Ruth Alderson', 'ruth.alderson@example.com', '(304) 555-0159'),
  ('a1000000-0000-4000-8000-000000000020', 'Ben Tasker', 'ben.tasker@example.com', '(304) 555-0186'),
  ('a1000000-0000-4000-8000-000000000021', 'Ivy Mullins', 'ivy.mullins@example.com', '(304) 555-0148'),
  ('a1000000-0000-4000-8000-000000000022', 'Carl Biser', 'carl.biser@example.com', '(304) 555-0104')
on conflict (listing_id) do nothing;

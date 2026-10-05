-- Complete DEMO smoke coverage: fictional owners (profiles, photos, co-ops,
-- affiliations, FarmTec), listing field gaps, and owner_id links.
-- All display names / emails / media are clearly DEMO.

create extension if not exists pgcrypto;

-- Allow bundled /demo/* assets for smoke-test fixtures (still require http(s) for real uploads).
alter table public.profiles drop constraint if exists profiles_avatar_url_ok;
alter table public.profiles
  add constraint profiles_avatar_url_ok check (
    avatar_url is null
    or avatar_url ~* '^https?://'
    or avatar_url ~* '^/demo/'
  );

alter table public.profiles drop constraint if exists profiles_logo_url_ok;
alter table public.profiles
  add constraint profiles_logo_url_ok check (
    logo_url is null
    or logo_url ~* '^https?://'
    or logo_url ~* '^/demo/'
  );

-- ---------------------------------------------------------------------------
-- Auth users (trigger creates bare profiles)
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'demo.mara.ellison@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Mara Ellison"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'demo.dale.horst@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Dale Horst"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'demo.ruth.miller@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Ruth Miller"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'demo.lila.crowe@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Lila Crowe"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000005',
    'authenticated',
    'authenticated',
    'demo.hannah.stoltzfus@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Hannah Stoltzfus"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000006',
    'authenticated',
    'authenticated',
    'demo.claire.bowman@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Claire Bowman"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'b1000000-0000-4000-8000-000000000007',
    'authenticated',
    'authenticated',
    'demo.ruth.alderson@example.com',
    crypt('demo-no-login', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"display_name":"DEMO · Ruth Alderson"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do update set
  email = excluded.email,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    'b1000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000001',
      'email', 'demo.mara.ellison@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000001',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    'b1000000-0000-4000-8000-000000000002',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000002',
      'email', 'demo.dale.horst@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000002',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    'b1000000-0000-4000-8000-000000000003',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000003',
      'email', 'demo.ruth.miller@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000003',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    'b1000000-0000-4000-8000-000000000004',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000004',
      'email', 'demo.lila.crowe@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000004',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    'b1000000-0000-4000-8000-000000000005',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000005',
      'email', 'demo.hannah.stoltzfus@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000005',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    'b1000000-0000-4000-8000-000000000006',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000006',
      'email', 'demo.claire.bowman@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000006',
    now(),
    now(),
    now()
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    'b1000000-0000-4000-8000-000000000007',
    jsonb_build_object(
      'sub', 'b1000000-0000-4000-8000-000000000007',
      'email', 'demo.ruth.alderson@example.com',
      'email_verified', true
    ),
    'email',
    'b1000000-0000-4000-8000-000000000007',
    now(),
    now(),
    now()
  )
on conflict (provider, provider_id) do nothing;

-- Ensure profiles exist if trigger already ran or skipped
insert into public.profiles (id, display_name, role)
values
  ('b1000000-0000-4000-8000-000000000001', 'DEMO · Mara Ellison', 'user'),
  ('b1000000-0000-4000-8000-000000000002', 'DEMO · Dale Horst', 'user'),
  ('b1000000-0000-4000-8000-000000000003', 'DEMO · Ruth Miller', 'user'),
  ('b1000000-0000-4000-8000-000000000004', 'DEMO · Lila Crowe', 'user'),
  ('b1000000-0000-4000-8000-000000000005', 'DEMO · Hannah Stoltzfus', 'user'),
  ('b1000000-0000-4000-8000-000000000006', 'DEMO · Claire Bowman', 'user'),
  ('b1000000-0000-4000-8000-000000000007', 'DEMO · Ruth Alderson', 'user')
on conflict (id) do update set display_name = excluded.display_name;

-- ---------------------------------------------------------------------------
-- Rich DEMO profiles
-- ---------------------------------------------------------------------------
update public.profiles set
  display_name = 'DEMO · Mara Ellison',
  home_state = 'Ohio',
  home_county = 'Wayne',
  alliance_slug = 'northeast',
  organic_certified = true,
  organic_certifier = 'oeffa',
  offers_land = true,
  offers_livestock = false,
  member_oeffa = true,
  member_sare = true,
  oeffa_certified = true,
  other_certified = false,
  other_certification_notes = null,
  affiliation_orgs = array['osu-extension', 'stratford'],
  accreditations = array['DEMO · Grazing School 2024'],
  avatar_url = '/demo/avatar-land.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = array['/demo/pasture-1.svg', '/demo/pasture-2.svg'],
  livestock_photos = '{}'::text[]
where id = 'b1000000-0000-4000-8000-000000000001';

update public.profiles set
  display_name = 'DEMO · Dale Horst',
  home_state = 'Ohio',
  home_county = 'Darke',
  alliance_slug = 'northwest',
  organic_certified = false,
  organic_certifier = null,
  offers_land = true,
  offers_livestock = true,
  member_oeffa = false,
  member_sare = true,
  oeffa_certified = false,
  other_certified = true,
  other_certification_notes = 'DEMO · conventional GAP audit',
  affiliation_orgs = array['osu-extension'],
  accreditations = array['DEMO · Cover crop mentor'],
  avatar_url = '/demo/avatar-land.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = array['/demo/pasture-2.svg'],
  livestock_photos = array['/demo/livestock-1.svg']
where id = 'b1000000-0000-4000-8000-000000000002';

update public.profiles set
  display_name = 'DEMO · Ruth Miller',
  home_state = 'Ohio',
  home_county = 'Holmes',
  alliance_slug = 'northeast',
  organic_certified = true,
  organic_certifier = 'oeffa',
  offers_land = false,
  offers_livestock = true,
  member_oeffa = true,
  member_sare = false,
  oeffa_certified = true,
  other_certified = false,
  other_certification_notes = null,
  affiliation_orgs = array['osu-extension'],
  accreditations = '{}'::text[],
  avatar_url = '/demo/avatar-stock.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = '{}'::text[],
  livestock_photos = array['/demo/livestock-1.svg', '/demo/livestock-2.svg']
where id = 'b1000000-0000-4000-8000-000000000003';

update public.profiles set
  display_name = 'DEMO · Lila Crowe',
  home_state = 'Ohio',
  home_county = 'Brown',
  alliance_slug = 'southwest',
  organic_certified = false,
  organic_certifier = null,
  offers_land = true,
  offers_livestock = true,
  member_oeffa = false,
  member_sare = false,
  oeffa_certified = false,
  other_certified = false,
  other_certification_notes = null,
  affiliation_orgs = array['osu-extension'],
  accreditations = array['DEMO · Brush-control crew'],
  avatar_url = '/demo/avatar-stock.svg',
  logo_url = null,
  pasture_photos = array['/demo/pasture-1.svg'],
  livestock_photos = array['/demo/livestock-2.svg']
where id = 'b1000000-0000-4000-8000-000000000004';

update public.profiles set
  display_name = 'DEMO · Hannah Stoltzfus',
  home_state = 'Pennsylvania',
  home_county = 'Lancaster',
  alliance_slug = 'northeast',
  organic_certified = true,
  organic_certifier = 'pco',
  offers_land = true,
  offers_livestock = true,
  member_oeffa = false,
  member_sare = true,
  oeffa_certified = false,
  other_certified = false,
  other_certification_notes = null,
  affiliation_orgs = array['psu-extension'],
  accreditations = array['DEMO · PCO producer'],
  avatar_url = '/demo/avatar-land.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = array['/demo/pasture-1.svg', '/demo/pasture-2.svg'],
  livestock_photos = array['/demo/livestock-1.svg']
where id = 'b1000000-0000-4000-8000-000000000005';

update public.profiles set
  display_name = 'DEMO · Claire Bowman',
  home_state = 'Kentucky',
  home_county = 'Bourbon',
  alliance_slug = 'southwest',
  organic_certified = true,
  organic_certifier = 'kda',
  offers_land = true,
  offers_livestock = true,
  member_oeffa = false,
  member_sare = true,
  oeffa_certified = false,
  other_certified = false,
  other_certification_notes = null,
  affiliation_orgs = array['uk-extension'],
  accreditations = '{}'::text[],
  avatar_url = '/demo/avatar-land.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = array['/demo/pasture-2.svg'],
  livestock_photos = array['/demo/livestock-1.svg']
where id = 'b1000000-0000-4000-8000-000000000006';

update public.profiles set
  display_name = 'DEMO · Ruth Alderson',
  home_state = 'West Virginia',
  home_county = 'Greenbrier',
  alliance_slug = 'southeast',
  organic_certified = false,
  organic_certifier = null,
  offers_land = true,
  offers_livestock = true,
  member_oeffa = false,
  member_sare = false,
  oeffa_certified = false,
  other_certified = true,
  other_certification_notes = 'DEMO · WV Grown',
  affiliation_orgs = array['wvu-extension'],
  accreditations = array['DEMO · Mountain grazer'],
  avatar_url = '/demo/avatar-stock.svg',
  logo_url = '/demo/logo-farm.svg',
  pasture_photos = array['/demo/pasture-1.svg'],
  livestock_photos = array['/demo/livestock-1.svg', '/demo/livestock-2.svg']
where id = 'b1000000-0000-4000-8000-000000000007';

-- Co-op memberships (flex every co-op lane)
delete from public.profile_coops
where profile_id::text like 'b1000000-0000-4000-8000-%';

insert into public.profile_coops (profile_id, coop_slug, membership_role)
values
  ('b1000000-0000-4000-8000-000000000001', 'organic-valley', 'member'),
  ('b1000000-0000-4000-8000-000000000001', 'oeffa-growers', 'member'),
  ('b1000000-0000-4000-8000-000000000002', 'farmers-union', 'member'),
  ('b1000000-0000-4000-8000-000000000003', 'organic-valley', 'member'),
  ('b1000000-0000-4000-8000-000000000003', 'oeffa-growers', 'member'),
  ('b1000000-0000-4000-8000-000000000004', 'farmers-union', 'member'),
  ('b1000000-0000-4000-8000-000000000005', 'organic-valley', 'member'),
  ('b1000000-0000-4000-8000-000000000005', 'farmers-union', 'member'),
  ('b1000000-0000-4000-8000-000000000006', 'organic-valley', 'member'),
  ('b1000000-0000-4000-8000-000000000007', 'farmers-union', 'member'),
  ('b1000000-0000-4000-8000-000000000007', 'oeffa-growers', 'member');

-- FarmTec on every DEMO owner (consented, varied for admin rollup)
insert into public.farmtec_snapshots (
  profile_id,
  research_consent,
  total_acres,
  pct_row_crop,
  pct_cover_crop,
  pct_grass_pasture,
  pct_other_land,
  pct_fields_livestock_grazed,
  livestock_integration_goal,
  pct_ops_fossil_fuel,
  pct_ops_electric,
  pct_ops_pto_tractor,
  ff_pressures,
  ff_practices,
  notes
)
values
  (
    'b1000000-0000-4000-8000-000000000001',
    true, 180, 10, 20, 60, 10, 85, 'already_100', 40, 25, 35,
    array['diesel_fuel', 'fertilizer_n'],
    array['managed_grazing', 'cover_crops', 'on_farm_energy'],
    'DEMO FarmTec — organic pasture host (OH).'
  ),
  (
    'b1000000-0000-4000-8000-000000000002',
    true, 420, 55, 25, 15, 5, 40, 'working_toward_100', 70, 10, 55,
    array['diesel_fuel', 'fertilizer_n', 'plastics', 'purchased_feed'],
    array['cover_crops', 'reduced_till'],
    'DEMO FarmTec — conventional split farm (OH).'
  ),
  (
    'b1000000-0000-4000-8000-000000000003',
    true, 95, 0, 15, 70, 15, 95, 'already_100', 35, 30, 20,
    array['purchased_feed', 'transport'],
    array['managed_grazing', 'local_supply', 'animal_hand_power'],
    'DEMO FarmTec — organic herd seeker (OH).'
  ),
  (
    'b1000000-0000-4000-8000-000000000004',
    true, 60, 5, 10, 50, 35, 70, 'partial', 50, 20, 40,
    array['diesel_fuel', 'other'],
    array['managed_grazing', 'other'],
    'DEMO FarmTec — mixed livestock / brush crew (OH).'
  ),
  (
    'b1000000-0000-4000-8000-000000000005',
    true, 210, 20, 30, 40, 10, 75, 'working_toward_100', 45, 20, 40,
    array['diesel_fuel', 'propane_heat'],
    array['managed_grazing', 'cover_crops', 'reduced_till'],
    'DEMO FarmTec — PCO land host (PA).'
  ),
  (
    'b1000000-0000-4000-8000-000000000006',
    true, 300, 35, 20, 35, 10, 55, 'partial', 60, 15, 50,
    array['diesel_fuel', 'fertilizer_n', 'transport'],
    array['cover_crops', 'managed_grazing'],
    'DEMO FarmTec — KDA organic host (KY).'
  ),
  (
    'b1000000-0000-4000-8000-000000000007',
    true, 140, 5, 10, 65, 20, 80, 'already_100', 55, 15, 45,
    array['diesel_fuel', 'purchased_feed'],
    array['managed_grazing', 'electric_tools'],
    'DEMO FarmTec — mountain grazer (WV).'
  )
on conflict (profile_id) do update set
  research_consent = excluded.research_consent,
  total_acres = excluded.total_acres,
  pct_row_crop = excluded.pct_row_crop,
  pct_cover_crop = excluded.pct_cover_crop,
  pct_grass_pasture = excluded.pct_grass_pasture,
  pct_other_land = excluded.pct_other_land,
  pct_fields_livestock_grazed = excluded.pct_fields_livestock_grazed,
  livestock_integration_goal = excluded.livestock_integration_goal,
  pct_ops_fossil_fuel = excluded.pct_ops_fossil_fuel,
  pct_ops_electric = excluded.pct_ops_electric,
  pct_ops_pto_tractor = excluded.pct_ops_pto_tractor,
  ff_pressures = excluded.ff_pressures,
  ff_practices = excluded.ff_practices,
  notes = excluded.notes,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- Listing field coverage + owners
-- ---------------------------------------------------------------------------
update public.listings set
  organic_certifier = 'oeffa'
where id = 'a1000000-0000-4000-8000-000000000001'
  and organic_certified;

update public.listings set
  organic_certifier = 'oeffa'
where id = 'a1000000-0000-4000-8000-000000000007'
  and organic_certified;

-- Water not on site (land)
update public.listings set
  water_available = false,
  rate_notes = coalesce(rate_notes, '') || ' DEMO · no on-site water — bring a tank.'
where id = 'a1000000-0000-4000-8000-000000000003';

-- land_type = other
update public.listings set
  land_type = 'other',
  title = case
    when title ~* '^demo' then title
    else 'DEMO · ' || title
  end,
  description = 'DEMO · Mixed orchard floor and edge grass — classified as other forage for smoke testing.'
where id = 'a1000000-0000-4000-8000-000000000006';

-- livestock mixed + other
update public.listings set
  livestock_type = 'mixed',
  title = 'DEMO · Mixed cattle and sheep need summer grass',
  description = 'DEMO · Mixed herd for filter smoke tests: a few dry cows with a small ewe flock. Looking for pasture with water within travel radius.'
where id = 'a1000000-0000-4000-8000-000000000010';

update public.listings set
  livestock_type = 'other',
  title = 'DEMO · Heritage hogs for woodland browse',
  description = 'DEMO · Other livestock type for smoke tests: small heritage hog group suited to woodland edges and mast.'
where id = 'a1000000-0000-4000-8000-000000000009';

-- Extra organic land with PCO (PA)
update public.listings set
  organic_certified = true,
  organic_certifier = 'pco'
where id = 'a1000000-0000-4000-8000-000000000011';

-- Extra organic land with KDA (KY)
update public.listings set
  organic_certified = true,
  organic_certifier = 'kda'
where id = 'a1000000-0000-4000-8000-000000000015';

-- Ensure DEMO title prefix
update public.listings
set title = 'DEMO · ' || title
where is_demo
  and title !~* '^demo';

-- Attach owners
update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000001'
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000004',
  'a1000000-0000-4000-8000-000000000005'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000002'
where id in (
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003',
  'a1000000-0000-4000-8000-000000000006'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000003'
where id in (
  'a1000000-0000-4000-8000-000000000007',
  'a1000000-0000-4000-8000-000000000008'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000004'
where id in (
  'a1000000-0000-4000-8000-000000000009',
  'a1000000-0000-4000-8000-000000000010'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000005'
where id in (
  'a1000000-0000-4000-8000-000000000011',
  'a1000000-0000-4000-8000-000000000012',
  'a1000000-0000-4000-8000-000000000013',
  'a1000000-0000-4000-8000-000000000014'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000006'
where id in (
  'a1000000-0000-4000-8000-000000000015',
  'a1000000-0000-4000-8000-000000000016',
  'a1000000-0000-4000-8000-000000000017',
  'a1000000-0000-4000-8000-000000000018'
);

update public.listings set owner_id = 'b1000000-0000-4000-8000-000000000007'
where id in (
  'a1000000-0000-4000-8000-000000000019',
  'a1000000-0000-4000-8000-000000000020',
  'a1000000-0000-4000-8000-000000000021',
  'a1000000-0000-4000-8000-000000000022'
);

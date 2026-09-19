-- Organic certifying agent + partner affiliation orgs (Extension, Stratford, etc.).

alter table public.profiles
  add column if not exists organic_certifier text,
  add column if not exists affiliation_orgs text[] not null default '{}'::text[];

alter table public.profiles
  drop constraint if exists profiles_organic_certifier_ok;
alter table public.profiles
  add constraint profiles_organic_certifier_ok check (
    organic_certifier is null
    or organic_certifier in (
      'oeffa',
      'pco',
      'kda',
      'mosa',
      'ocia',
      'nofa-ny',
      'otco',
      'qcs',
      'qai',
      'onecert',
      'nics',
      'stellar',
      'scs',
      'organic-certifiers',
      'mda',
      'vof',
      'mofga',
      'ccof',
      'americert',
      'other'
    )
  );

alter table public.listings
  add column if not exists organic_certifier text;

alter table public.listings
  drop constraint if exists listings_organic_certifier_ok;
alter table public.listings
  add constraint listings_organic_certifier_ok check (
    organic_certifier is null
    or organic_certifier in (
      'oeffa',
      'pco',
      'kda',
      'mosa',
      'ocia',
      'nofa-ny',
      'otco',
      'qcs',
      'qai',
      'onecert',
      'nics',
      'stellar',
      'scs',
      'organic-certifiers',
      'mda',
      'vof',
      'mofga',
      'ccof',
      'americert',
      'other'
    )
  );

-- Backfill: OEFFA-certified profiles imply OEFFA as certifier when organic.
update public.profiles
set organic_certifier = 'oeffa'
where oeffa_certified = true
  and organic_certifier is null;

grant update (
  display_name,
  home_state,
  home_county,
  alliance_slug,
  organic_certified,
  organic_certifier,
  offers_land,
  offers_livestock,
  member_oeffa,
  member_sare,
  oeffa_certified,
  other_certified,
  other_certification_notes,
  affiliation_orgs,
  accreditations,
  avatar_url,
  logo_url,
  pasture_photos,
  livestock_photos
) on public.profiles to authenticated;

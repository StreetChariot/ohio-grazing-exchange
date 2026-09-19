-- Dual grazer/host profile roles, memberships, certifications, co-ops,
-- and member-only co-op forum lanes (org voices use membership_role = 'org').

alter table public.profiles
  add column if not exists offers_land boolean not null default false,
  add column if not exists offers_livestock boolean not null default false,
  add column if not exists member_oeffa boolean not null default false,
  add column if not exists member_sare boolean not null default false,
  add column if not exists oeffa_certified boolean not null default false,
  add column if not exists other_certified boolean not null default false,
  add column if not exists other_certification_notes text,
  add column if not exists accreditations text[] not null default '{}'::text[];

alter table public.profiles
  drop constraint if exists profiles_other_cert_notes_ok;
alter table public.profiles
  add constraint profiles_other_cert_notes_ok check (
    other_certification_notes is null
    or char_length(btrim(other_certification_notes)) between 2 and 200
  );

create table if not exists public.coops (
  slug text primary key,
  name text not null,
  description text not null,
  website_url text,
  constraint coops_name_ok check (char_length(btrim(name)) between 2 and 80),
  constraint coops_description_ok check (char_length(btrim(description)) between 8 and 400)
);

create table if not exists public.profile_coops (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  coop_slug text not null references public.coops (slug) on delete cascade,
  membership_role text not null default 'member'
    check (membership_role in ('member', 'org')),
  created_at timestamptz not null default now(),
  primary key (profile_id, coop_slug)
);

create index if not exists profile_coops_coop_idx
  on public.profile_coops (coop_slug);

insert into public.coops (slug, name, description, website_url)
values
  (
    'organic-valley',
    'Organic Valley',
    'Farmer-owned organic cooperative. Member and co-op staff channels stay private to this lane.',
    'https://www.organicvalley.coop/'
  ),
  (
    'farmers-union',
    'National Farmers Union',
    'Family farm advocacy and education. Use this lane for members who list NFU affiliation.',
    'https://nfu.org/'
  ),
  (
    'oeffa-growers',
    'OEFFA growers circle',
    'Private lane for OEFFA-affiliated members coordinating forage and herds in the Valley.',
    'https://www.oeffa.org/'
  )
on conflict (slug) do nothing;

alter table public.forum_boards
  add column if not exists coop_slug text references public.coops (slug) on delete cascade;

alter table public.forum_boards
  drop constraint if exists forum_boards_alliance_ok;
alter table public.forum_boards
  add constraint forum_boards_alliance_ok check (
    alliance_slug is null
    or alliance_slug in ('northwest', 'northeast', 'southwest', 'southeast')
  );

alter table public.forum_boards
  drop constraint if exists forum_boards_lane_ok;
alter table public.forum_boards
  add constraint forum_boards_lane_ok check (
    (alliance_slug is null and coop_slug is null)
    or (alliance_slug is not null and coop_slug is null)
    or (alliance_slug is null and coop_slug is not null)
  );

insert into public.forum_boards (slug, title, description, alliance_slug, coop_slug)
values
  (
    'coop-organic-valley',
    'Organic Valley members',
    'Private to Organic Valley members and co-op staff. Neighbor talk and co-op notices stay in this lane.',
    null,
    'organic-valley'
  ),
  (
    'coop-farmers-union',
    'Farmers Union members',
    'Private to Farmers Union affiliates on this exchange.',
    null,
    'farmers-union'
  ),
  (
    'coop-oeffa-growers',
    'OEFFA growers circle',
    'Private to members who list OEFFA affiliation here.',
    null,
    'oeffa-growers'
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  coop_slug = excluded.coop_slug,
  alliance_slug = excluded.alliance_slug;

create or replace function private.is_coop_member(target_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_coops pc
    where pc.profile_id = (select auth.uid())
      and pc.coop_slug = target_slug
  );
$$;

create or replace function private.can_access_forum_board(board text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.forum_boards b
    where b.slug = board
      and (
        b.coop_slug is null
        or (select private.is_admin())
        or (select private.is_coop_member(b.coop_slug))
      )
  );
$$;

grant execute on function private.is_coop_member(text) to anon, authenticated;
grant execute on function private.can_access_forum_board(text) to anon, authenticated;

alter table public.coops enable row level security;
alter table public.profile_coops enable row level security;

grant select on public.coops to anon, authenticated;
grant select, insert, update, delete on public.coops to service_role;

grant select on public.profile_coops to anon, authenticated;
grant insert, update, delete on public.profile_coops to authenticated;
grant select, insert, update, delete on public.profile_coops to service_role;

grant update (
  display_name,
  home_state,
  home_county,
  alliance_slug,
  organic_certified,
  offers_land,
  offers_livestock,
  member_oeffa,
  member_sare,
  oeffa_certified,
  other_certified,
  other_certification_notes,
  accreditations
) on public.profiles to authenticated;

drop policy if exists "coops are publicly readable" on public.coops;
create policy "coops are publicly readable"
  on public.coops
  for select
  to anon, authenticated
  using (true);

drop policy if exists "members read own coop ties" on public.profile_coops;
drop policy if exists "public can read coop memberships" on public.profile_coops;
create policy "public can read coop memberships"
  on public.profile_coops
  for select
  to anon, authenticated
  using (true);

drop policy if exists "members manage own coop ties" on public.profile_coops;
create policy "members manage own coop ties"
  on public.profile_coops
  for insert
  to authenticated
  with check (
    profile_id = (select auth.uid())
    and membership_role = 'member'
  );

drop policy if exists "members update own coop ties" on public.profile_coops;
create policy "members update own coop ties"
  on public.profile_coops
  for update
  to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_admin()))
  with check (
    (
      profile_id = (select auth.uid())
      and membership_role = 'member'
    )
    or (select private.is_admin())
  );

drop policy if exists "members delete own coop ties" on public.profile_coops;
create policy "members delete own coop ties"
  on public.profile_coops
  for delete
  to authenticated
  using (profile_id = (select auth.uid()) or (select private.is_admin()));

-- Public can still list public boards; coop boards only for members/hosts.
drop policy if exists "forum boards are public" on public.forum_boards;
create policy "forum boards by access"
  on public.forum_boards
  for select
  to anon, authenticated
  using (
    coop_slug is null
    or (select private.is_admin())
    or (select private.is_coop_member(coop_slug))
  );

drop policy if exists "forum topics are public" on public.forum_topics;
create policy "forum topics by board access"
  on public.forum_topics
  for select
  to anon, authenticated
  using ((select private.can_access_forum_board(board_slug)));

drop policy if exists "members can start topics" on public.forum_topics;
create policy "members can start topics"
  on public.forum_topics
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(title)) between 8 and 140
    and (select private.can_access_forum_board(board_slug))
  );

drop policy if exists "forum posts are public" on public.forum_posts;
create policy "forum posts by board access"
  on public.forum_posts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.forum_topics t
      where t.id = topic_id
        and (select private.can_access_forum_board(t.board_slug))
    )
  );

drop policy if exists "members can reply" on public.forum_posts;
create policy "members can reply"
  on public.forum_posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(body)) between 8 and 8000
    and exists (
      select 1
      from public.forum_topics t
      where t.id = topic_id
        and (select private.can_access_forum_board(t.board_slug))
    )
  );

-- Public profiles may show coop memberships (not emails).

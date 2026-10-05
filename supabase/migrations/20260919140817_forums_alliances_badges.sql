-- Forums, quadrant alliances, and confirmed graze counts for member badges.
-- Profiles become publicly readable (no emails on this table). Graze counts
-- only increment after the other party or a host confirms.

alter table public.profiles
  add column if not exists home_state text,
  add column if not exists home_county text,
  add column if not exists alliance_slug text;

alter table public.profiles
  drop constraint if exists profiles_home_state_ok;
alter table public.profiles
  add constraint profiles_home_state_ok check (
    home_state is null
    or home_state in ('Ohio', 'Pennsylvania', 'Kentucky', 'West Virginia')
  );

alter table public.profiles
  drop constraint if exists profiles_alliance_slug_ok;
alter table public.profiles
  add constraint profiles_alliance_slug_ok check (
    alliance_slug is null
    or alliance_slug in ('northwest', 'northeast', 'southwest', 'southeast')
  );

create index if not exists profiles_alliance_slug_idx
  on public.profiles (alliance_slug);

create table if not exists public.forum_boards (
  slug text primary key,
  title text not null,
  description text not null,
  alliance_slug text,
  constraint forum_boards_alliance_ok check (
    alliance_slug is null
    or alliance_slug in ('northwest', 'northeast', 'southwest', 'southeast')
  )
);

insert into public.forum_boards (slug, title, description, alliance_slug)
values
  (
    'valley',
    'Valley yard',
    'Ohio, Pennsylvania, Kentucky, and West Virginia. Listings, seasons, and anything that does not belong to one quadrant.',
    null
  ),
  (
    'northwest',
    'Northwest Alliance',
    'Western Lake Erie and till-plain Ohio. Toledo, Lima, Findlay, and the Indiana line.',
    'northwest'
  ),
  (
    'northeast',
    'Northeast Alliance',
    'Pennsylvania, northeastern Ohio, and the northern panhandle. Cleveland, Youngstown, Erie, Pittsburgh, Wheeling.',
    'northeast'
  ),
  (
    'southwest',
    'Southwest Alliance',
    'Kentucky and the Cincinnati–Dayton side of Ohio. Bluegrass and the Ohio River west.',
    'southwest'
  ),
  (
    'southeast',
    'Southeast Alliance',
    'West Virginia and Appalachian Ohio. Athens, Marietta, Charleston, Huntington, and the hill counties.',
    'southeast'
  )
on conflict (slug) do nothing;

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  board_slug text not null references public.forum_boards (slug) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  constraint forum_topics_title_ok check (
    char_length(btrim(title)) between 8 and 140
  )
);

create index if not exists forum_topics_board_created_idx
  on public.forum_topics (board_slug, created_at desc);

create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint forum_posts_body_ok check (
    char_length(btrim(body)) between 8 and 8000
  )
);

create index if not exists forum_posts_topic_created_idx
  on public.forum_posts (topic_id, created_at);

create table if not exists public.grazing_completions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  host_id uuid not null references auth.users (id) on delete cascade,
  grazier_id uuid not null references auth.users (id) on delete cascade,
  proposed_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint grazing_parties_distinct check (host_id <> grazier_id),
  constraint grazing_proposer_is_party check (
    proposed_by = host_id or proposed_by = grazier_id
  )
);

create unique index if not exists grazing_one_open_per_pair
  on public.grazing_completions (listing_id, host_id, grazier_id)
  where status in ('pending', 'confirmed');

create index if not exists grazing_host_idx on public.grazing_completions (host_id);
create index if not exists grazing_grazier_idx on public.grazing_completions (grazier_id);
create index if not exists grazing_listing_idx on public.grazing_completions (listing_id);

create or replace function private.grazing_completion_guard()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.listing_id is distinct from old.listing_id
       or new.host_id is distinct from old.host_id
       or new.grazier_id is distinct from old.grazier_id
       or new.proposed_by is distinct from old.proposed_by then
      raise exception 'graze parties cannot change';
    end if;
    if old.status <> 'pending' then
      raise exception 'graze already resolved';
    end if;
    if new.status not in ('confirmed', 'declined') then
      raise exception 'invalid graze status';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists grazing_completion_guard on public.grazing_completions;
create trigger grazing_completion_guard
  before update on public.grazing_completions
  for each row execute function private.grazing_completion_guard();

alter table public.forum_boards enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_posts enable row level security;
alter table public.grazing_completions enable row level security;

grant select on public.profiles to anon, authenticated;
grant update (display_name, home_state, home_county, alliance_slug)
  on public.profiles to authenticated;

grant select on public.forum_boards to anon, authenticated;
grant select on public.forum_topics to anon, authenticated;
grant insert on public.forum_topics to authenticated;
grant select on public.forum_posts to anon, authenticated;
grant insert on public.forum_posts to authenticated;
grant delete on public.forum_topics to authenticated;
grant delete on public.forum_posts to authenticated;

grant select on public.grazing_completions to anon, authenticated;
grant insert, update on public.grazing_completions to authenticated;

drop policy if exists "read own profile or admin reads all" on public.profiles;
drop policy if exists "update own display name" on public.profiles;

create policy "profiles are publicly readable"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "update own profile place"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "forum boards are public"
  on public.forum_boards
  for select
  to anon, authenticated
  using (true);

create policy "forum topics are public"
  on public.forum_topics
  for select
  to anon, authenticated
  using (true);

create policy "members can start topics"
  on public.forum_topics
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(title)) between 8 and 140
  );

create policy "authors or hosts can delete topics"
  on public.forum_topics
  for delete
  to authenticated
  using (
    author_id = (select auth.uid()) or (select private.is_admin())
  );

create policy "forum posts are public"
  on public.forum_posts
  for select
  to anon, authenticated
  using (true);

create policy "members can reply"
  on public.forum_posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(body)) between 8 and 8000
  );

create policy "authors or hosts can delete posts"
  on public.forum_posts
  for delete
  to authenticated
  using (
    author_id = (select auth.uid()) or (select private.is_admin())
  );

create policy "confirmed grazes are public; pending to parties"
  on public.grazing_completions
  for select
  to anon, authenticated
  using (
    status = 'confirmed'
    or host_id = (select auth.uid())
    or grazier_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "other party can log a graze"
  on public.grazing_completions
  for insert
  to authenticated
  with check (
    proposed_by = (select auth.uid())
    and (proposed_by = host_id or proposed_by = grazier_id)
    and host_id <> grazier_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id is not null
        and l.owner_id <> (select auth.uid())
        and (
          (
            l.side = 'land'
            and host_id = l.owner_id
            and grazier_id = (select auth.uid())
          )
          or (
            l.side = 'livestock'
            and grazier_id = l.owner_id
            and host_id = (select auth.uid())
          )
        )
    )
  );

create policy "other party or host can resolve a graze"
  on public.grazing_completions
  for update
  to authenticated
  using (
    status = 'pending'
    and (
      (select private.is_admin())
      or (
        proposed_by <> (select auth.uid())
        and (
          host_id = (select auth.uid())
          or grazier_id = (select auth.uid())
        )
      )
    )
  )
  with check (
    status in ('confirmed', 'declined')
    and (
      (select private.is_admin())
      or (
        proposed_by <> (select auth.uid())
        and (
          host_id = (select auth.uid())
          or grazier_id = (select auth.uid())
        )
      )
    )
  );

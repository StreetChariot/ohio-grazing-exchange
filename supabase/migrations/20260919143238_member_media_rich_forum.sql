-- Member profile media and longer forum bodies for rich text HTML.

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists logo_url text,
  add column if not exists pasture_photos text[] not null default '{}'::text[],
  add column if not exists livestock_photos text[] not null default '{}'::text[];

alter table public.profiles
  drop constraint if exists profiles_avatar_url_ok;
alter table public.profiles
  add constraint profiles_avatar_url_ok check (
    avatar_url is null or avatar_url ~* '^https?://'
  );

alter table public.profiles
  drop constraint if exists profiles_logo_url_ok;
alter table public.profiles
  add constraint profiles_logo_url_ok check (
    logo_url is null or logo_url ~* '^https?://'
  );

alter table public.profiles
  drop constraint if exists profiles_pasture_photos_ok;
alter table public.profiles
  add constraint profiles_pasture_photos_ok check (
    cardinality(pasture_photos) <= 8
  );

alter table public.profiles
  drop constraint if exists profiles_livestock_photos_ok;
alter table public.profiles
  add constraint profiles_livestock_photos_ok check (
    cardinality(livestock_photos) <= 8
  );

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
  accreditations,
  avatar_url,
  logo_url,
  pasture_photos,
  livestock_photos
) on public.profiles to authenticated;

alter table public.forum_posts
  drop constraint if exists forum_posts_body_ok;
alter table public.forum_posts
  add constraint forum_posts_body_ok check (
    char_length(btrim(body)) between 8 and 20000
  );

drop policy if exists "members can reply" on public.forum_posts;
create policy "members can reply"
  on public.forum_posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(body)) between 8 and 20000
    and exists (
      select 1
      from public.forum_topics t
      where t.id = topic_id
        and (select private.can_access_forum_board(t.board_slug))
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-media',
  'member-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "member media is publicly readable" on storage.objects;
create policy "member media is publicly readable"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'member-media');

drop policy if exists "members upload own media" on storage.objects;
create policy "members upload own media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'member-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "members update own media" on storage.objects;
create policy "members update own media"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'member-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'member-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "members delete own media" on storage.objects;
create policy "members delete own media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'member-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "members can reply" on public.forum_posts;
create policy "members can reply"
  on public.forum_posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and char_length(btrim(body)) between 8 and 20000
    and exists (
      select 1
      from public.forum_topics t
      where t.id = topic_id
        and (select private.can_access_forum_board(t.board_slug))
    )
  );

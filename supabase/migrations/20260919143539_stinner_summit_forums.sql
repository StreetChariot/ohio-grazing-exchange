-- Stinner Summit forums by year. 2026 is the 20th Annual Summit (first year
-- tracked here). Each year has a main board plus a Chosen Projects lane.

alter table public.forum_boards
  add column if not exists series text,
  add column if not exists summit_year integer,
  add column if not exists lane_kind text;

alter table public.forum_boards
  drop constraint if exists forum_boards_series_ok;
alter table public.forum_boards
  add constraint forum_boards_series_ok check (
    series is null or series in ('stinner')
  );

alter table public.forum_boards
  drop constraint if exists forum_boards_lane_kind_ok;
alter table public.forum_boards
  add constraint forum_boards_lane_kind_ok check (
    lane_kind is null or lane_kind in ('year', 'chosen-projects')
  );

alter table public.forum_boards
  drop constraint if exists forum_boards_stinner_year_ok;
alter table public.forum_boards
  add constraint forum_boards_stinner_year_ok check (
    (series is distinct from 'stinner' and summit_year is null and lane_kind is null)
    or (
      series = 'stinner'
      and summit_year >= 2026
      and lane_kind in ('year', 'chosen-projects')
    )
  );

create index if not exists forum_boards_stinner_year_idx
  on public.forum_boards (series, summit_year);

insert into public.forum_boards (
  slug, title, description, alliance_slug, coop_slug, series, summit_year, lane_kind
)
values
  (
    'stinner-2026',
    '20th Annual Stinner Summit (2026)',
    'Agroecological collaborations to reduce farm reliance on fossil fuels. Malabar Farm State Park · September 18, 2026. Precanned Summit threads live here; open one to start the conversation.',
    null,
    null,
    'stinner',
    2026,
    'year'
  ),
  (
    'stinner-2026-chosen',
    'Chosen Projects · 2026',
    'Projects chosen from the 20th Stinner Summit process. Updates, collaboration asks, and follow-through for the Valley.',
    null,
    null,
    'stinner',
    2026,
    'chosen-projects'
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  series = excluded.series,
  summit_year = excluded.summit_year,
  lane_kind = excluded.lane_kind,
  alliance_slug = excluded.alliance_slug,
  coop_slug = excluded.coop_slug;

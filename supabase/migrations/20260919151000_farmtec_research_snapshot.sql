-- FarmTec research snapshot: land-use mix, livestock integration, and
-- equipment/energy shares for OSU Extension (Wooster) and Stinner Summit
-- fossil-fuel reduction research. Private to the member (+ hosts).

create table if not exists public.farmtec_snapshots (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now(),
  research_consent boolean not null default false,
  total_acres numeric(10, 1),
  pct_row_crop smallint,
  pct_cover_crop smallint,
  pct_grass_pasture smallint,
  pct_other_land smallint,
  pct_fields_livestock_grazed smallint,
  livestock_integration_goal text,
  pct_ops_fossil_fuel smallint,
  pct_ops_electric smallint,
  pct_ops_pto_tractor smallint,
  ff_pressures text[] not null default '{}'::text[],
  ff_practices text[] not null default '{}'::text[],
  notes text,
  constraint farmtec_total_acres_ok check (
    total_acres is null or (total_acres >= 0 and total_acres <= 100000)
  ),
  constraint farmtec_pct_row_ok check (
    pct_row_crop is null or (pct_row_crop between 0 and 100)
  ),
  constraint farmtec_pct_cover_ok check (
    pct_cover_crop is null or (pct_cover_crop between 0 and 100)
  ),
  constraint farmtec_pct_grass_ok check (
    pct_grass_pasture is null or (pct_grass_pasture between 0 and 100)
  ),
  constraint farmtec_pct_other_ok check (
    pct_other_land is null or (pct_other_land between 0 and 100)
  ),
  constraint farmtec_pct_grazed_ok check (
    pct_fields_livestock_grazed is null
    or (pct_fields_livestock_grazed between 0 and 100)
  ),
  constraint farmtec_integration_goal_ok check (
    livestock_integration_goal is null
    or livestock_integration_goal in (
      'already_100',
      'working_toward_100',
      'partial',
      'not_pursuing',
      'not_applicable'
    )
  ),
  constraint farmtec_pct_fossil_ok check (
    pct_ops_fossil_fuel is null or (pct_ops_fossil_fuel between 0 and 100)
  ),
  constraint farmtec_pct_electric_ok check (
    pct_ops_electric is null or (pct_ops_electric between 0 and 100)
  ),
  constraint farmtec_pct_pto_ok check (
    pct_ops_pto_tractor is null or (pct_ops_pto_tractor between 0 and 100)
  ),
  constraint farmtec_notes_ok check (
    notes is null or char_length(btrim(notes)) between 2 and 800
  )
);

create or replace function public.touch_farmtec_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists farmtec_snapshots_touch on public.farmtec_snapshots;
create trigger farmtec_snapshots_touch
  before update on public.farmtec_snapshots
  for each row
  execute function public.touch_farmtec_updated_at();

alter table public.farmtec_snapshots enable row level security;

grant select, insert, update, delete on public.farmtec_snapshots to authenticated;
grant select, insert, update, delete on public.farmtec_snapshots to service_role;

drop policy if exists "members read own farmtec" on public.farmtec_snapshots;
create policy "members read own farmtec"
  on public.farmtec_snapshots
  for select
  to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists "members insert own farmtec" on public.farmtec_snapshots;
create policy "members insert own farmtec"
  on public.farmtec_snapshots
  for insert
  to authenticated
  with check (profile_id = (select auth.uid()));

drop policy if exists "members update own farmtec" on public.farmtec_snapshots;
create policy "members update own farmtec"
  on public.farmtec_snapshots
  for update
  to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.is_admin())
  )
  with check (
    profile_id = (select auth.uid())
    or (select private.is_admin())
  );

drop policy if exists "members delete own farmtec" on public.farmtec_snapshots;
create policy "members delete own farmtec"
  on public.farmtec_snapshots
  for delete
  to authenticated
  using (
    profile_id = (select auth.uid())
    or (select private.is_admin())
  );

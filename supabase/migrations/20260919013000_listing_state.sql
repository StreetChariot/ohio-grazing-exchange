-- Service area is the Ohio Valley side of a future Midwest link:
-- Ohio, Pennsylvania, Kentucky, and West Virginia.
alter table public.listings
  add column if not exists state text not null default 'Ohio';

alter table public.listings drop constraint if exists listings_state_ok;

alter table public.listings
  add constraint listings_state_ok
  check (state in ('Ohio', 'Pennsylvania', 'Kentucky', 'West Virginia'));

create index if not exists listings_state_idx on public.listings (state);

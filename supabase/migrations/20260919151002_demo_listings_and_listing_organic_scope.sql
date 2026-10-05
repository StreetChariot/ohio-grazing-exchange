-- Mark seed listings as DEMO. Scope organic graze rules to the listing:
-- farms may run organic and conventional acres/herds as separate listings.

alter table public.listings
  add column if not exists is_demo boolean not null default false;

update public.listings
set is_demo = true
where id::text like 'a1000000-0000-4000-8000-%';

update public.listings
set title = 'DEMO · ' || title
where is_demo
  and title !~* '^demo\b';

create index if not exists listings_is_demo_idx
  on public.listings (is_demo)
  where is_demo;

-- Organic attestation is about this listing's field/herd, not the whole farm.
create or replace function private.grazing_organic_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  listing_organic boolean;
begin
  select l.organic_certified into listing_organic
  from public.listings l
  where l.id = new.listing_id;

  if listing_organic is null then
    raise exception 'listing not found for graze';
  end if;

  if listing_organic then
    if not new.organic_attested then
      raise exception 'organic listing requires organic counterpart attestation';
    end if;
  else
    if new.organic_attested then
      raise exception 'non-organic listing cannot carry organic attestation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists grazing_organic_guard on public.grazing_completions;
create trigger grazing_organic_guard
  before insert on public.grazing_completions
  for each row execute function private.grazing_organic_guard();

-- Free member accounts and host admins, Midwest Grazing Exchange style.
-- Browse stays public. Posting, contact details, and listing edits require a
-- signed-in user. Hosts (role = admin) can update or delete any listing.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.admin_allowlist (
  email text primary key
);

insert into public.admin_allowlist (email)
values ('streetchariot@hotmail.com')
on conflict do nothing;

create table public.listing_contacts (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  constraint listing_contacts_name_ok check (
    char_length(btrim(contact_name)) between 2 and 80
  ),
  constraint listing_contacts_email_ok check (
    contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
);

insert into public.listing_contacts (
  listing_id, contact_name, contact_email, contact_phone
)
select id, contact_name, contact_email, contact_phone
from public.listings;

drop policy if exists "anyone can post a listing" on public.listings;
drop policy if exists "listings are publicly readable" on public.listings;

alter table public.listings
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

alter table public.listings
  drop column if exists contact_name,
  drop column if exists contact_email,
  drop column if exists contact_phone;

create index if not exists listings_owner_id_idx on public.listings (owner_id);

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select p.role = 'admin' from public.profiles p where p.id = auth.uid()),
    false
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data->>'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    case
      when exists (
        select 1 from public.admin_allowlist a
        where lower(a.email) = lower(new.email)
      ) then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.admin_allowlist enable row level security;
alter table public.listing_contacts enable row level security;

revoke all on public.admin_allowlist from anon, authenticated, public;
revoke insert on public.listings from anon;
revoke all on public.listing_contacts from anon, public;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;

grant select, insert, update, delete on public.listing_contacts to authenticated;
grant select, insert, update, delete on public.listing_contacts to service_role;

create policy "listings are publicly readable"
  on public.listings
  for select
  to anon, authenticated
  using (true);

create policy "members can post listings"
  on public.listings
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and char_length(btrim(title)) between 8 and 140
    and char_length(btrim(description)) between 20 and 4000
  );

create policy "owners can update listings"
  on public.listings
  for update
  to authenticated
  using (owner_id = auth.uid() or private.is_admin())
  with check (owner_id = auth.uid() or private.is_admin());

create policy "owners can delete listings"
  on public.listings
  for delete
  to authenticated
  using (owner_id = auth.uid() or private.is_admin());

create policy "read own profile or admin reads all"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or private.is_admin());

create policy "update own display name"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "members can read contacts"
  on public.listing_contacts
  for select
  to authenticated
  using (true);

create policy "owners can insert contacts"
  on public.listing_contacts
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = auth.uid() or private.is_admin())
    )
  );

create policy "owners can update contacts"
  on public.listing_contacts
  for update
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = auth.uid() or private.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = auth.uid() or private.is_admin())
    )
  );

create policy "owners can delete contacts"
  on public.listing_contacts
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = auth.uid() or private.is_admin())
    )
  );

-- Wrap auth.uid() / is_admin() in SELECT so Postgres can init the plan once.

drop policy if exists "members can post listings" on public.listings;
drop policy if exists "owners can update listings" on public.listings;
drop policy if exists "owners can delete listings" on public.listings;
drop policy if exists "read own profile or admin reads all" on public.profiles;
drop policy if exists "update own display name" on public.profiles;
drop policy if exists "owners can insert contacts" on public.listing_contacts;
drop policy if exists "owners can update contacts" on public.listing_contacts;
drop policy if exists "owners can delete contacts" on public.listing_contacts;

create policy "members can post listings"
  on public.listings
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and char_length(btrim(title)) between 8 and 140
    and char_length(btrim(description)) between 20 and 4000
  );

create policy "owners can update listings"
  on public.listings
  for update
  to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()))
  with check (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "owners can delete listings"
  on public.listings
  for delete
  to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "read own profile or admin reads all"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "update own display name"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "owners can insert contacts"
  on public.listing_contacts
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = (select auth.uid()) or (select private.is_admin()))
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
        and (l.owner_id = (select auth.uid()) or (select private.is_admin()))
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.owner_id = (select auth.uid()) or (select private.is_admin()))
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
        and (l.owner_id = (select auth.uid()) or (select private.is_admin()))
    )
  );

-- Education shelf suggestions from educators and members.
-- Anyone may submit; only hosts may read or update status.

create table if not exists public.education_suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  url text not null,
  authors text,
  source_label text,
  topics text[] not null default '{}'::text[],
  notes text,
  submitter_name text not null,
  submitter_email text not null,
  profile_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending',
  constraint education_suggestions_title_ok check (
    char_length(btrim(title)) between 4 and 200
  ),
  constraint education_suggestions_url_ok check (
    char_length(btrim(url)) between 8 and 500
  ),
  constraint education_suggestions_authors_ok check (
    authors is null or char_length(btrim(authors)) between 2 and 400
  ),
  constraint education_suggestions_source_ok check (
    source_label is null or char_length(btrim(source_label)) between 2 and 200
  ),
  constraint education_suggestions_notes_ok check (
    notes is null or char_length(btrim(notes)) between 2 and 1200
  ),
  constraint education_suggestions_name_ok check (
    char_length(btrim(submitter_name)) between 2 and 80
  ),
  constraint education_suggestions_email_ok check (
    char_length(btrim(submitter_email)) between 5 and 120
  ),
  constraint education_suggestions_status_ok check (
    status in ('pending', 'reviewed', 'added', 'declined')
  )
);

create index if not exists education_suggestions_created_idx
  on public.education_suggestions (created_at desc);

create index if not exists education_suggestions_status_idx
  on public.education_suggestions (status);

alter table public.education_suggestions enable row level security;

grant select, insert, update on public.education_suggestions to authenticated;
grant insert on public.education_suggestions to anon;
grant select, insert, update, delete on public.education_suggestions to service_role;

drop policy if exists "anyone can suggest education" on public.education_suggestions;
create policy "anyone can suggest education"
  on public.education_suggestions
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "hosts read education suggestions" on public.education_suggestions;
create policy "hosts read education suggestions"
  on public.education_suggestions
  for select
  to authenticated
  using ((select private.is_admin()));

drop policy if exists "hosts update education suggestions" on public.education_suggestions;
create policy "hosts update education suggestions"
  on public.education_suggestions
  for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

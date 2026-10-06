-- Viaje Financiero: one project for both profiles (member and mentor).

-- ─── Profiles ──────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  email text,
  role text not null default 'member' check (role in ('member', 'mentor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.is_mentor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'mentor');
$$;

create policy "Profiles: own row or mentor"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_mentor()));

create policy "Profiles: update own row"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Members may change their name, never their role.
revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

-- ─── Journeys (progress state synced from the app) ─────────────────────────
create table public.journeys (
  user_id uuid primary key references auth.users on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.journeys enable row level security;

create policy "Journeys: own row or mentor"
  on public.journeys for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_mentor()));

create policy "Journeys: insert own row"
  on public.journeys for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Journeys: update own row"
  on public.journeys for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ─── New user → profile + journey ──────────────────────────────────────────
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  insert into public.journeys (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Messages (member ↔ mentor, per station) ───────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references auth.users on delete cascade,
  level_id smallint not null default 1,
  sender text not null check (sender in ('member', 'mentor')),
  author_id uuid not null default auth.uid() references auth.users on delete set null,
  kind text not null default 'text' check (kind in ('text', 'audio')),
  body text,
  audio_path text,
  duration_sec integer,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint message_has_content check (
    (kind = 'text' and body is not null and length(trim(body)) > 0)
    or (kind = 'audio' and audio_path is not null)
  )
);

create index messages_member_created_idx on public.messages (member_id, created_at);

alter table public.messages enable row level security;

create policy "Messages: own conversation or mentor"
  on public.messages for select to authenticated
  using (member_id = (select auth.uid()) or (select public.is_mentor()));

create policy "Messages: members write to their own conversation"
  on public.messages for insert to authenticated
  with check (
    (sender = 'member' and member_id = (select auth.uid()) and author_id = (select auth.uid()))
    or (sender = 'mentor' and (select public.is_mentor()) and author_id = (select auth.uid()))
  );

create policy "Messages: mark as read"
  on public.messages for update to authenticated
  using (member_id = (select auth.uid()) or (select public.is_mentor()));

-- Only the read receipt can change after a message is sent.
revoke update on public.messages from authenticated;
grant update (read_at) on public.messages to authenticated;

-- ─── Transformation map + phrases (written by the mentor) ──────────────────
create table public.transformations (
  member_id uuid primary key references auth.users on delete cascade,
  map jsonb not null,
  mantras jsonb not null,
  published_at timestamptz,
  updated_by uuid references auth.users on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.transformations enable row level security;

create policy "Transformations: member sees own once published; mentor sees all"
  on public.transformations for select to authenticated
  using ((member_id = (select auth.uid()) and published_at is not null) or (select public.is_mentor()));

create policy "Transformations: mentor writes"
  on public.transformations for insert to authenticated
  with check ((select public.is_mentor()));

create policy "Transformations: mentor updates"
  on public.transformations for update to authenticated
  using ((select public.is_mentor()))
  with check ((select public.is_mentor()));

-- ─── Lock anonymous access down ────────────────────────────────────────────
revoke all on public.profiles, public.journeys, public.messages, public.transformations from anon;

-- ─── Realtime for the chat and the deliverable ─────────────────────────────
alter publication supabase_realtime add table public.messages, public.transformations;

-- ─── Voice notes (private bucket, one folder per member) ───────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audios', 'audios', false, 10485760, array['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/webm', 'audio/mpeg']);

create policy "Audios: read own folder or mentor"
  on storage.objects for select to authenticated
  using (bucket_id = 'audios' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_mentor())));

create policy "Audios: upload to own folder or mentor"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'audios' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.is_mentor())));

-- Emails invited as mentors: they get the mentor role as soon as they sign up.
create table private.mentor_invites (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
revoke all on private.mentor_invites from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    case when exists (select 1 from private.mentor_invites where email = lower(new.email)) then 'mentor' else 'member' end
  );
  insert into public.journeys (user_id) values (new.id);
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

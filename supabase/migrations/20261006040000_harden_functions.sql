-- Keep helper functions out of the public API (security advisors 0028/0029).

-- The trigger function only runs from the auth.users trigger.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_mentor() is needed by RLS policies, but must not be an RPC endpoint.
-- Policies reference the function by OID, so moving the schema keeps them working.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter function public.is_mentor() set schema private;
revoke execute on function private.is_mentor() from public, anon;
grant execute on function private.is_mentor() to authenticated;

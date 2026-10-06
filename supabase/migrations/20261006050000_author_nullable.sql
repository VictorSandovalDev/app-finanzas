-- Deleting a mentor account must keep the conversation: author_id becomes null instead of failing.
alter table public.messages alter column author_id drop not null;

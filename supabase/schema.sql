-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)
-- before deploying the app.
--
-- This version adds per-user data isolation: every project row is owned by
-- the user who created it (via Supabase Auth), and Row Level Security (RLS)
-- makes sure a signed-in user can only ever see/edit/delete their own rows.

create table if not exists projects (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  client_name text not null,
  consultant text default '',
  pmo_owner text default '',
  launch_date timestamptz,
  type text not null,
  color text not null default 'pink',
  created_date timestamptz not null default now(),
  category_order jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb
);

-- If you already created the table WITHOUT user_id in an earlier version of
-- this schema, run this instead of the create table above to migrate it:
--
-- alter table projects add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table projects alter column user_id set default auth.uid();
-- -- then manually assign existing rows to a user, e.g.:
-- -- update projects set user_id = '<some-user-uuid>' where user_id is null;
-- alter table projects alter column user_id set not null;

alter table projects enable row level security;

-- Drop the old fully-public policy if it exists (from the pre-auth version)
drop policy if exists "Public access (no auth) - for internal tool use only" on projects;

-- Each signed-in user can only see, create, update, and delete their own projects.
create policy "Users can view their own projects"
  on projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- Helpful indexes
create index if not exists projects_user_id_idx on projects (user_id);
create index if not exists projects_created_date_idx on projects (created_date desc);

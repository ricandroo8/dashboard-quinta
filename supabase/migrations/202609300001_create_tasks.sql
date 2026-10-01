create table if not exists public.tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 1 and 120),
  title text not null check (char_length(title) between 1 and 500),
  description text not null default '',
  subject_id text not null default '',
  due_date timestamptz,
  completed boolean not null default false,
  completed_at timestamptz,
  is_urgent boolean not null default false,
  is_important boolean not null default false,
  type text not null default 'OTHER',
  created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  external_task_id text,
  primary key (user_id, client_id)
);

alter table public.tasks enable row level security;

revoke all on table public.tasks from anon, authenticated;
grant select, insert, update, delete on table public.tasks to authenticated;

drop policy if exists "Users can read their own tasks" on public.tasks;
create policy "Users can read their own tasks"
on public.tasks for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own tasks" on public.tasks;
create policy "Users can insert their own tasks"
on public.tasks for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own tasks" on public.tasks;
create policy "Users can update their own tasks"
on public.tasks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own tasks" on public.tasks;
create policy "Users can delete their own tasks"
on public.tasks for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists tasks_user_updated_idx
on public.tasks (user_id, updated_at desc);

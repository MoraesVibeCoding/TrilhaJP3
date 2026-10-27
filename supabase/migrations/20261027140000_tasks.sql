-- T5: demandas da empresa (docs/SPEC.md 4.2; tasks/t5-spec.md). Exclusão lógica: arquivar é archived_at.

-- A chave composta abaixo exige que (organization_id, id) seja único em projects.
alter table public.projects
  add constraint projects_organization_id_id_key unique (organization_id, id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null,
  -- Subtarefas entram na T7; por ora fica sempre nulo.
  parent_task_id uuid references public.tasks (id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200 and length(title) <= 200),
  description text check (length(description) <= 5000),
  state text not null default 'todo' check (state in ('todo', 'doing', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date date,
  is_now boolean not null default false,
  done_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  -- Projeto sempre da mesma empresa, mesmo que uma política falhe.
  foreign key (organization_id, project_id)
    references public.projects (organization_id, id) on delete cascade
);

create index tasks_organization_id_idx on public.tasks (organization_id);
create index tasks_project_id_idx on public.tasks (project_id);
-- Decisão do Pedro (2026-10-27): no máximo uma demanda "Agora" por empresa.
create unique index tasks_one_now_per_organization on public.tasks (organization_id) where is_now;

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function private.set_updated_at();

-- "Feito hoje" lê done_at: liga ao entrar em Feito, desliga ao sair. O cliente não escreve nele.
create function private.set_done_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.state = 'done' and (tg_op = 'INSERT' or old.state <> 'done') then
    new.done_at = now();
  elsif new.state <> 'done' then
    new.done_at = null;
  end if;
  return new;
end;
$$;

create trigger tasks_set_done_at
before insert or update on public.tasks
for each row execute function private.set_done_at();

-- Tudo tirado e devolvido só o que o app usa; empresa, projeto, autor e done_at não vêm do cliente na alteração.
alter table public.tasks enable row level security;
revoke all on table public.tasks from anon, authenticated;
grant select on table public.tasks to authenticated;
grant insert (organization_id, project_id, title, description, state, priority, due_date, is_now)
  on table public.tasks to authenticated;
grant update (title, description, state, priority, due_date, is_now, archived_at)
  on table public.tasks to authenticated;

create policy "membros leem as demandas da própria empresa"
on public.tasks for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros criam demandas na própria empresa"
on public.tasks for insert
to authenticated
with check ((select private.is_member(organization_id)));

create policy "membros alteram demandas da própria empresa"
on public.tasks for update
to authenticated
using ((select private.is_member(organization_id)))
with check ((select private.is_member(organization_id)));

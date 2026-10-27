-- T4: projetos da empresa (docs/SPEC.md 4.2; tasks/t4-spec.md). Exclusão lógica: arquivar é archived_at.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120 and length(name) <= 120),
  description text check (length(description) <= 2000),
  status text not null default 'idea' check (status in ('idea', 'in_progress', 'paused', 'done')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  -- Só https: nada de javascript:, data: ou http sem criptografia.
  link text check (link ~ '^https://[^[:space:]]+$' and length(link) <= 2000),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index projects_organization_id_idx on public.projects (organization_id);

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row execute function private.set_updated_at();

-- Tabela nova em public nasce com tudo liberado: tira tudo e devolve só o que o app usa.
-- Grants por coluna: a empresa e o autor não mudam depois de criados, e o autor nunca vem do cliente.
alter table public.projects enable row level security;
revoke all on table public.projects from anon, authenticated;
grant select on table public.projects to authenticated;
grant insert (organization_id, name, description, status, priority, link)
  on table public.projects to authenticated;
grant update (name, description, status, priority, link, archived_at)
  on table public.projects to authenticated;

create policy "membros leem os projetos da própria empresa"
on public.projects for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros criam projetos na própria empresa"
on public.projects for insert
to authenticated
with check ((select private.is_member(organization_id)));

create policy "membros alteram projetos da própria empresa"
on public.projects for update
to authenticated
using ((select private.is_member(organization_id)))
with check ((select private.is_member(organization_id)));

-- T2: empresas, vínculos e a regra de acesso por empresa (ADR 0003, tasks/t2-spec.md).
-- Na v1 o navegador só lê: criar empresa ou vínculo fica com migrações e com a chave de serviço no servidor.

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

-- Fora do esquema exposto pela API: função security definer em esquema exposto seria chamável por qualquer cliente.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- security definer: lê memberships como dono, sem passar pela RLS de memberships (evita recursão nas políticas).
create function private.is_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.organization_id = org
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_member(uuid) from public, anon;
grant execute on function private.is_member(uuid) to authenticated;

-- Tabela nova em public nasce com tudo liberado para anon e authenticated: tira tudo e devolve só a leitura.
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
revoke all on table public.organizations, public.memberships from anon, authenticated;
grant select on table public.organizations, public.memberships to authenticated;

create policy "membros leem a própria empresa"
on public.organizations for select
to authenticated
using ((select private.is_member(id)));

create policy "membros leem os vínculos da própria empresa"
on public.memberships for select
to authenticated
using ((select private.is_member(organization_id)));

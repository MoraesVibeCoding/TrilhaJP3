-- T8: etiquetas da empresa (docs/SPEC.md 4; tasks/t8-spec.md, seção 4).

-- As chaves compostas abaixo exigem que (organization_id, id) seja único em tasks.
alter table public.tasks
  add constraint tasks_organization_id_id_key unique (organization_id, id);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 40 and length(name) <= 40),
  -- Paleta curta da marca Moraes Coding; o nome vai sempre escrito, a cor nunca é a única pista.
  color text not null default 'nevoa' check (color in ('nevoa', 'mata', 'alta', 'mostarda', 'tijolo')),
  created_at timestamptz not null default now(),
  unique (organization_id, id)
);

-- "Bug" e " bug " são a mesma etiqueta na empresa.
create unique index labels_unique_name on public.labels (organization_id, lower(trim(name)));

create table public.task_labels (
  task_id uuid not null,
  label_id uuid not null,
  organization_id uuid not null,
  primary key (task_id, label_id),
  -- Demanda e etiqueta sempre da mesma empresa, mesmo que uma política falhe.
  foreign key (organization_id, task_id)
    references public.tasks (organization_id, id) on delete cascade,
  foreign key (organization_id, label_id)
    references public.labels (organization_id, id) on delete cascade
);

create index task_labels_label_id_idx on public.task_labels (label_id);
create index task_labels_organization_id_idx on public.task_labels (organization_id);

-- Etiqueta só em demanda de primeiro nível: subtarefa não recebe.
create function private.check_label_task()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.parent_task_id is not null
  ) then
    raise exception 'etiqueta só vai em demanda, não em subtarefa'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger task_labels_check_task
before insert on public.task_labels
for each row execute function private.check_label_task();

-- Tudo tirado e devolvido só o que o app usa: a etiqueta não é renomeada nem muda de empresa nesta tarefa.
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
revoke all on table public.labels, public.task_labels from anon, authenticated;
grant select on table public.labels, public.task_labels to authenticated;
grant insert (organization_id, name, color) on table public.labels to authenticated;
grant update (color) on table public.labels to authenticated;
grant insert (task_id, label_id, organization_id) on table public.task_labels to authenticated;
grant delete on table public.task_labels to authenticated;

create policy "membros leem as etiquetas da própria empresa"
on public.labels for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros criam etiquetas na própria empresa"
on public.labels for insert
to authenticated
with check ((select private.is_member(organization_id)));

create policy "membros alteram etiquetas da própria empresa"
on public.labels for update
to authenticated
using ((select private.is_member(organization_id)))
with check ((select private.is_member(organization_id)));

create policy "membros leem as etiquetas aplicadas na própria empresa"
on public.task_labels for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros aplicam etiquetas na própria empresa"
on public.task_labels for insert
to authenticated
with check ((select private.is_member(organization_id)));

create policy "membros tiram etiquetas na própria empresa"
on public.task_labels for delete
to authenticated
using ((select private.is_member(organization_id)));

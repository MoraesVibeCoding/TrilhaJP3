-- T10: histórico das demandas, gravado por gatilhos (docs/SPEC.md 4.2, item 2; tasks/t10-spec.md, seção 4).
-- Só inserção, e só pelos gatilhos: o app lê, ninguém escreve, altera ou apaga.

create table public.task_events (
  -- Número em sequência: vários eventos da mesma gravação têm o mesmo created_at.
  id bigint generated always as identity primary key,
  organization_id uuid not null,
  task_id uuid not null,
  actor_id uuid references auth.users (id) on delete set null,
  actor_name text not null,
  type text not null check (type in (
    'task_created', 'field_changed', 'task_archived', 'task_restored',
    'subtask_added', 'subtask_renamed', 'subtask_done', 'subtask_reopened', 'subtask_removed',
    'label_applied', 'label_removed', 'comment_added', 'comment_removed'
  )),
  changes jsonb not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (organization_id, task_id)
    references public.tasks (organization_id, id) on delete cascade
);

create index task_events_task_id_idx on public.task_events (task_id, created_at desc, id desc);
create index task_events_organization_id_idx on public.task_events (organization_id);

-- Grava um evento em nome de quem está na sessão; sem sessão (chave de serviço), "Sistema".
create function private.log_task_event(org uuid, task uuid, kind text, data jsonb default '{}')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.task_events (organization_id, task_id, actor_id, actor_name, type, changes)
  values (
    org, task, auth.uid(),
    case
      when auth.uid() is null then 'Sistema'
      else coalesce(nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''), 'Membro')
    end,
    kind, data
  );
end;
$$;

create function private.field_event(org uuid, task uuid, field text, old_value jsonb, new_value jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old_value is distinct from new_value then
    perform private.log_task_event(org, task, 'field_changed',
      jsonb_build_object('field', field, 'from', old_value, 'to', new_value));
  end if;
end;
$$;

create function private.log_task_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Subtarefa: o evento vai para a demanda mãe.
  if new.parent_task_id is not null then
    if tg_op = 'INSERT' then
      perform private.log_task_event(new.organization_id, new.parent_task_id, 'subtask_added',
        jsonb_build_object('title', new.title));
      return null;
    end if;
    if old.archived_at is null and new.archived_at is not null then
      perform private.log_task_event(new.organization_id, new.parent_task_id, 'subtask_removed',
        jsonb_build_object('title', new.title));
      return null;
    end if;
    if old.title is distinct from new.title then
      perform private.log_task_event(new.organization_id, new.parent_task_id, 'subtask_renamed',
        jsonb_build_object('from', old.title, 'to', new.title));
    end if;
    if old.state is distinct from new.state and (old.state = 'done' or new.state = 'done') then
      perform private.log_task_event(new.organization_id, new.parent_task_id,
        case when new.state = 'done' then 'subtask_done' else 'subtask_reopened' end,
        jsonb_build_object('title', new.title));
    end if;
    return null;
  end if;

  if tg_op = 'INSERT' then
    perform private.log_task_event(new.organization_id, new.id, 'task_created');
    return null;
  end if;

  perform private.field_event(new.organization_id, new.id, 'title', to_jsonb(old.title), to_jsonb(new.title));
  perform private.field_event(new.organization_id, new.id, 'state', to_jsonb(old.state), to_jsonb(new.state));
  perform private.field_event(new.organization_id, new.id, 'priority', to_jsonb(old.priority), to_jsonb(new.priority));
  perform private.field_event(new.organization_id, new.id, 'due_date', to_jsonb(old.due_date), to_jsonb(new.due_date));
  if old.project_id is distinct from new.project_id then
    perform private.field_event(new.organization_id, new.id, 'project',
      (select to_jsonb(p.name) from public.projects p where p.id = old.project_id),
      (select to_jsonb(p.name) from public.projects p where p.id = new.project_id));
  end if;
  -- A descrição pode ser longa: o histórico diz só que mudou.
  if old.description is distinct from new.description then
    perform private.log_task_event(new.organization_id, new.id, 'field_changed',
      jsonb_build_object('field', 'description'));
  end if;
  perform private.field_event(new.organization_id, new.id, 'is_now', to_jsonb(old.is_now), to_jsonb(new.is_now));
  if old.archived_at is null and new.archived_at is not null then
    perform private.log_task_event(new.organization_id, new.id, 'task_archived');
  elsif old.archived_at is not null and new.archived_at is null then
    perform private.log_task_event(new.organization_id, new.id, 'task_restored');
  end if;
  return null;
end;
$$;

create trigger tasks_log_change
after insert or update on public.tasks
for each row execute function private.log_task_change();

create function private.log_label_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_task uuid := coalesce(new.task_id, old.task_id);
  row_org uuid := coalesce(new.organization_id, old.organization_id);
  label_name text;
begin
  -- Apagar a demanda (ou a etiqueta) tira a aplicação em cascata: aí não há o que registrar.
  if not exists (select 1 from public.tasks t where t.id = row_task) then
    return null;
  end if;
  select l.name into label_name from public.labels l where l.id = coalesce(new.label_id, old.label_id);
  if label_name is null then
    return null;
  end if;
  perform private.log_task_event(row_org, row_task,
    case when tg_op = 'INSERT' then 'label_applied' else 'label_removed' end,
    jsonb_build_object('name', label_name));
  return null;
end;
$$;

create trigger task_labels_log_change
after insert or delete on public.task_labels
for each row execute function private.log_label_change();

create function private.log_comment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_task_event(new.organization_id, new.task_id, 'comment_added');
  elsif old.archived_at is null and new.archived_at is not null then
    perform private.log_task_event(new.organization_id, new.task_id, 'comment_removed');
  end if;
  return null;
end;
$$;

create trigger task_comments_log_change
after insert or update on public.task_comments
for each row execute function private.log_comment_change();

-- Funções só para os gatilhos: ninguém as chama direto.
revoke all on function private.log_task_event(uuid, uuid, text, jsonb) from public;
revoke all on function private.field_event(uuid, uuid, text, jsonb, jsonb) from public;

alter table public.task_events enable row level security;
revoke all on table public.task_events from anon, authenticated;
grant select on table public.task_events to authenticated;

create policy "membros leem o histórico da própria empresa"
on public.task_events for select
to authenticated
using ((select private.is_member(organization_id)));

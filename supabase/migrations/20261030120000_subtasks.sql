-- T7: subtarefas de um nível (tasks/t7-spec.md, seção 5). Subtarefa é a demanda filha (parent_task_id).

-- O cliente grava a mãe só na criação; a alteração continua sem parent_task_id, então ninguém troca de mãe.
grant insert (parent_task_id) on table public.tasks to authenticated;

-- Subtarefa nunca é a "Agora": a Agora é sempre uma demanda.
alter table public.tasks
  add constraint tasks_subtask_not_now check (parent_task_id is null or not is_now);

-- Um só nível: a mãe existe, é de primeiro nível, não está arquivada e é da mesma empresa e do mesmo projeto.
-- Roda com as permissões de quem grava: mãe de outra empresa não aparece e cai na mesma recusa.
create function private.check_subtask_parent()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_task_id is not null and not exists (
    select 1
    from public.tasks p
    where p.id = new.parent_task_id
      and p.parent_task_id is null
      and p.archived_at is null
      and p.organization_id = new.organization_id
      and p.project_id = new.project_id
  ) then
    raise exception 'subtarefa só tem um nível: a mãe precisa ser uma demanda ativa do mesmo projeto'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger tasks_check_subtask_parent
before insert or update of parent_task_id on public.tasks
for each row execute function private.check_subtask_parent();

-- Reverte 20261030120000_subtasks.sql. Não apaga dado: as subtarefas criadas continuam.
drop trigger if exists tasks_check_subtask_parent on public.tasks;
drop function if exists private.check_subtask_parent();
alter table public.tasks drop constraint if exists tasks_subtask_not_now;
revoke insert (parent_task_id) on table public.tasks from authenticated;

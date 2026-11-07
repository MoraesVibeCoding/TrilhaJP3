-- Reverte 20261104130000_task_events.sql. Apaga o histórico: só use enquanto o banco não tiver dado real.
drop trigger if exists tasks_log_change on public.tasks;
drop trigger if exists task_labels_log_change on public.task_labels;
drop trigger if exists task_comments_log_change on public.task_comments;
drop function if exists private.log_task_change();
drop function if exists private.log_label_change();
drop function if exists private.log_comment_change();
drop function if exists private.field_event(uuid, uuid, text, jsonb, jsonb);
drop function if exists private.log_task_event(uuid, uuid, text, jsonb);
drop table if exists public.task_events;

-- Reverte 20261102120000_labels.sql. Apaga as etiquetas e as aplicações: só use enquanto o banco não tiver dado real.
drop table if exists public.task_labels;
drop table if exists public.labels;
drop function if exists private.check_label_task();
alter table public.tasks drop constraint if exists tasks_organization_id_id_key;

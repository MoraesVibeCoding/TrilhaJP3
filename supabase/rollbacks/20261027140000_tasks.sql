-- Reverte 20261027140000_tasks.sql. Apaga as demandas: só use enquanto o banco não tiver dado real.
drop table if exists public.tasks;
drop function if exists private.set_done_at();
alter table public.projects drop constraint if exists projects_organization_id_id_key;

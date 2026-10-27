-- Reverte 20261027120000_projects.sql. Apaga os projetos: só use enquanto o banco não tiver dado real.
drop table if exists public.projects;
drop function if exists private.set_updated_at();

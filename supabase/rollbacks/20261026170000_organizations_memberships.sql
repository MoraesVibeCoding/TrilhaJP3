-- Reverte 20261026170000_organizations_memberships.sql. Apaga os dados das duas tabelas:
-- só use enquanto o banco não tiver dado real (D1 e D2).
drop table if exists public.memberships;
drop table if exists public.organizations;
drop function if exists private.is_member(uuid);
drop schema if exists private;

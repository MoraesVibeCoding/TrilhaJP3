-- Apagar a conta de quem comentou mantém o comentário, como em projects e tasks (created_by vira nulo).
-- O nome continua em author_name, gravado no momento do comentário. Sem autor, ninguém arquiva o comentário:
-- a política de update exige created_by = auth.uid().
alter table public.task_comments alter column created_by drop not null;
alter table public.task_comments drop constraint task_comments_created_by_fkey;
alter table public.task_comments
  add constraint task_comments_created_by_fkey
  foreign key (created_by) references auth.users (id) on delete set null;

-- Reverte 20261104120000_comment_author_kept.sql. Não apaga dado: se já houver comentário sem autor,
-- o "set not null" falha e o rollback para, para alguém decidir o que fazer com esses comentários.
alter table public.task_comments drop constraint task_comments_created_by_fkey;
alter table public.task_comments
  add constraint task_comments_created_by_fkey
  foreign key (created_by) references auth.users (id) on delete cascade;
alter table public.task_comments alter column created_by set not null;

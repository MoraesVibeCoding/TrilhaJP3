-- Reverte 20261103120000_comments.sql. Apaga os comentários: só use enquanto o banco não tiver dado real.
drop table if exists public.task_comments;
drop function if exists private.check_comment_task();

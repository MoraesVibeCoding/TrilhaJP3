-- Reverte 20261111120000_attachments.sql. Apaga os registros de anexos e os eventos de anexo do histórico:
-- só use enquanto o banco não tiver dado real. O bucket "attachments" e os arquivos dele ficam: o Supabase não
-- deixa apagar tabelas do Storage por SQL ("Direct deletion from storage tables is not allowed"). Se for
-- preciso tirá-los, use a API com a chave de serviço: storage.emptyBucket('attachments') e depois
-- storage.deleteBucket('attachments'). Sem as políticas abaixo, ninguém além da chave de serviço os acessa.
drop trigger if exists attachments_log_change on public.attachments;
drop trigger if exists attachments_check on public.attachments;
drop function if exists private.log_attachment_change();
drop function if exists private.check_attachment();
drop table if exists public.attachments;
delete from public.task_events where type in ('attachment_added', 'attachment_removed');
alter table public.task_events drop constraint task_events_type_check;
alter table public.task_events add constraint task_events_type_check check (type in (
  'task_created', 'field_changed', 'task_archived', 'task_restored',
  'subtask_added', 'subtask_renamed', 'subtask_done', 'subtask_reopened', 'subtask_removed',
  'label_applied', 'label_removed', 'comment_added', 'comment_removed'
));
drop policy if exists "membros enviam anexos na pasta da própria empresa" on storage.objects;
drop policy if exists "membros leem anexos da própria empresa" on storage.objects;
drop policy if exists "quem enviou apaga o próprio anexo" on storage.objects;
drop function if exists private.can_use_attachment_folder(text, boolean);

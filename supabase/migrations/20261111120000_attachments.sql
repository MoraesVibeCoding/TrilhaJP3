-- T11: anexos das demandas (docs/SPEC.md 4.2, item 4; tasks/t11-spec.md, seções 3 e 4).
-- Bucket privado com limite de tamanho e lista de tipos; caminho {organization_id}/{task_id}/{uuid}-{nome};
-- a tabela guarda o que o Storage diz do arquivo, não o que o navegador diz.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments', 'attachments', false, 10485760,
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'text/plain', 'text/csv'
  ]
)
-- Reaplicar depois de um rollback: o bucket fica (o Supabase não deixa apagá-lo por SQL), e os limites voltam.
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Pasta de anexo válida: empresa de quem está na sessão e demanda de primeiro nível dessa empresa.
create function private.can_use_attachment_folder(object_name text, for_upload boolean)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  folders text[] := storage.foldername(object_name);
begin
  if coalesce(array_length(folders, 1), 0) < 2 then
    return false;
  end if;
  if not exists (
    select 1 from public.memberships m
    where m.user_id = (select auth.uid()) and m.organization_id::text = folders[1]
  ) then
    return false;
  end if;
  return not for_upload or exists (
    select 1 from public.tasks t
    where t.id::text = folders[2] and t.organization_id::text = folders[1]
  );
end;
$$;

revoke all on function private.can_use_attachment_folder(text, boolean) from public, anon;
grant execute on function private.can_use_attachment_folder(text, boolean) to authenticated;

create policy "membros enviam anexos na pasta da própria empresa"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'attachments'
  and (select private.can_use_attachment_folder(name, true))
);

create policy "membros leem anexos da própria empresa"
on storage.objects for select
to authenticated
using (
  bucket_id = 'attachments'
  and (select private.can_use_attachment_folder(name, false))
);

create policy "quem enviou apaga o próprio anexo"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'attachments'
  and owner_id = (select auth.uid())::text
  and (select private.can_use_attachment_folder(name, false))
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  task_id uuid not null,
  storage_path text not null unique,
  file_name text not null check (length(trim(file_name)) between 1 and 255),
  -- Preenchidos pelo gatilho a partir do objeto no Storage; o cliente não tem permissão de enviá-los.
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  uploaded_by uuid default auth.uid() references auth.users (id) on delete set null,
  uploader_name text not null default coalesce(
    nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''),
    'Membro'
  ),
  created_at timestamptz not null default now(),
  foreign key (organization_id, task_id)
    references public.tasks (organization_id, id) on delete cascade
);

create index attachments_task_id_idx on public.attachments (task_id);
create index attachments_organization_id_idx on public.attachments (organization_id);

-- O banco não confia no navegador: confere a demanda, a extensão e o objeto, e copia tamanho e tipo do Storage.
create function private.check_attachment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  stored record;
begin
  if exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.parent_task_id is not null
  ) then
    raise exception 'anexo só vai em demanda, não em subtarefa'
      using errcode = '23514';
  end if;
  if lower(new.file_name) !~ '\.(jpe?g|png|webp|gif|heic|heif|pdf|docx?|xlsx?|pptx?|odt|ods|odp|txt|csv)$' then
    raise exception 'tipo de arquivo não aceito: %', new.file_name
      using errcode = '23514';
  end if;
  if new.storage_path !~ ('^' || new.organization_id || '/' || new.task_id
      || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-.+$') then
    raise exception 'o arquivo não está na pasta desta demanda'
      using errcode = '23514';
  end if;
  select o.metadata ->> 'mimetype' as mime, (o.metadata ->> 'size')::bigint as size
    into stored
    from storage.objects o
    where o.bucket_id = 'attachments' and o.name = new.storage_path;
  if not found then
    raise exception 'o arquivo não foi enviado'
      using errcode = '23514';
  end if;
  new.mime_type := stored.mime;
  new.size_bytes := stored.size;
  return new;
end;
$$;

create trigger attachments_check
before insert on public.attachments
for each row execute function private.check_attachment();

alter table public.attachments enable row level security;
revoke all on table public.attachments from anon, authenticated;
grant select on table public.attachments to authenticated;
grant insert (organization_id, task_id, storage_path, file_name) on table public.attachments to authenticated;
grant delete on table public.attachments to authenticated;

create policy "membros leem os anexos da própria empresa"
on public.attachments for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros anexam na própria empresa"
on public.attachments for insert
to authenticated
with check ((select private.is_member(organization_id)) and uploaded_by = (select auth.uid()));

create policy "quem enviou remove o próprio anexo"
on public.attachments for delete
to authenticated
using ((select private.is_member(organization_id)) and uploaded_by = (select auth.uid()));

-- Histórico (T10): anexar e remover, com o nome do arquivo.
alter table public.task_events drop constraint task_events_type_check;
alter table public.task_events add constraint task_events_type_check check (type in (
  'task_created', 'field_changed', 'task_archived', 'task_restored',
  'subtask_added', 'subtask_renamed', 'subtask_done', 'subtask_reopened', 'subtask_removed',
  'label_applied', 'label_removed', 'comment_added', 'comment_removed',
  'attachment_added', 'attachment_removed'
));

create function private.log_attachment_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.log_task_event(new.organization_id, new.task_id, 'attachment_added',
      jsonb_build_object('name', new.file_name));
    return null;
  end if;
  -- Apagar a demanda tira os anexos em cascata: aí não há o que registrar.
  if exists (select 1 from public.tasks t where t.id = old.task_id) then
    perform private.log_task_event(old.organization_id, old.task_id, 'attachment_removed',
      jsonb_build_object('name', old.file_name));
  end if;
  return null;
end;
$$;

create trigger attachments_log_change
after insert or delete on public.attachments
for each row execute function private.log_attachment_change();

-- T9: comentários das demandas (docs/SPEC.md 5.5; tasks/t9-spec.md, seção 4).

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null,
  task_id uuid not null,
  body text not null check (length(trim(body)) between 1 and 5000 and length(body) <= 5000),
  -- Autor e nome vêm da sessão; o cliente não tem permissão de enviar estas colunas.
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name text not null default coalesce(
    nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''),
    'Membro'
  ),
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  -- Demanda sempre da mesma empresa, mesmo que uma política falhe.
  foreign key (organization_id, task_id)
    references public.tasks (organization_id, id) on delete cascade
);

create index task_comments_task_id_idx on public.task_comments (task_id);
create index task_comments_organization_id_idx on public.task_comments (organization_id);

-- Comentário só em demanda de primeiro nível.
create function private.check_comment_task()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.tasks t
    where t.id = new.task_id and t.parent_task_id is not null
  ) then
    raise exception 'comentário só vai em demanda, não em subtarefa'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger task_comments_check_task
before insert on public.task_comments
for each row execute function private.check_comment_task();

-- Publicado, o comentário não muda: só arquivar, e só quem escreveu. Não há delete.
alter table public.task_comments enable row level security;
revoke all on table public.task_comments from anon, authenticated;
grant select on table public.task_comments to authenticated;
grant insert (organization_id, task_id, body) on table public.task_comments to authenticated;
grant update (archived_at) on table public.task_comments to authenticated;

create policy "membros leem os comentários da própria empresa"
on public.task_comments for select
to authenticated
using ((select private.is_member(organization_id)));

create policy "membros comentam na própria empresa"
on public.task_comments for insert
to authenticated
with check ((select private.is_member(organization_id)) and created_by = (select auth.uid()));

create policy "o autor arquiva o próprio comentário"
on public.task_comments for update
to authenticated
using ((select private.is_member(organization_id)) and created_by = (select auth.uid()))
with check ((select private.is_member(organization_id)) and created_by = (select auth.uid()));

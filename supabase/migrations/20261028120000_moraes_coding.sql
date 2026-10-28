-- Tarefa de marca (tasks/tm-spec.md, fatia 3): a empresa passa a se chamar Moraes Coding.
-- Só renomeia a linha da T3 (id fixo) se ela ainda tiver o nome antigo; reversão em supabase/rollbacks/.
update public.organizations
set name = 'Moraes Coding'
where id = '5d35ad87-c91e-4d87-a95a-11d421149f19'
  and name = 'Moraes CodeVibe';

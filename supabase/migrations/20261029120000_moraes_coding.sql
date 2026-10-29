-- Troca de marca (tasks/marca-spec.md, item 8.2): a empresa passa a se chamar Moraes Coding.
-- Só muda o nome; o id, os vínculos e os dados ficam como estão.
update public.organizations
set name = 'Moraes Coding'
where id = '5d35ad87-c91e-4d87-a95a-11d421149f19';

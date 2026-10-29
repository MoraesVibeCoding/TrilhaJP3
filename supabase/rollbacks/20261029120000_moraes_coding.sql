-- Reverte 20261029120000_moraes_coding.sql: devolve o nome anterior. Não apaga dado.
update public.organizations
set name = 'Moraes CodeVibe'
where id = '5d35ad87-c91e-4d87-a95a-11d421149f19';

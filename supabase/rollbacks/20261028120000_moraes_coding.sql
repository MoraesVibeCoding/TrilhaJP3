-- Reverte 20261028120000_moraes_coding.sql: a empresa volta a se chamar Moraes CodeVibe.
update public.organizations
set name = 'Moraes CodeVibe'
where id = '5d35ad87-c91e-4d87-a95a-11d421149f19'
  and name = 'Moraes Coding';

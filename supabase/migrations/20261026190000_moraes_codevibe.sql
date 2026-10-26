-- T3: a empresa da v1. Id fixo para os testes e a documentação acharem a linha.
-- O vínculo de dono do Pedro é criado fora do repositório (o e-mail não vai para um repositório público).
insert into public.organizations (id, name)
values ('5d35ad87-c91e-4d87-a95a-11d421149f19', 'Moraes CodeVibe')
on conflict (id) do nothing;

-- Reverte 20261026190000_moraes_codevibe.sql. Apaga a empresa e, em cascata, os vínculos dela.
delete from public.organizations where id = '5d35ad87-c91e-4d87-a95a-11d421149f19';

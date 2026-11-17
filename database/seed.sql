\c tca_gd

create extension if not exists pgcrypto;

-- tipos
insert into tipo_contato (nome) values ('Email'), ('Telefone');

insert into tipo_investimento (nome)
values ('Renda Fixa'), ('Ações'), ('Fundos Imobiliários');

-- fornecedores (CNPJs fictícios)
insert into fornecedor (cnpj, nome) values
('11222333000181', 'Banco Alfa S.A.'),
('22333444000172', 'Corretora Beta'),
('33444555000163', 'Gestora Gama');

insert into contato_fornecedor (fornecedor, tipo, contato) values
('11222333000181', (select codigo from tipo_contato where nome = 'Email'), 'contato@bancoalfa.com'),
('11222333000181', (select codigo from tipo_contato where nome = 'Telefone'), '5133334444'),
('22333444000172', (select codigo from tipo_contato where nome = 'Email'), 'atendimento@corretorabeta.com'),
('33444555000163', (select codigo from tipo_contato where nome = 'Email'), 'ri@gestoragama.com');

-- investimentos (rendimento em % ao ano, valor unitário)
insert into investimento (tipo, fornecedor, nome, rendimento, valor) values
((select codigo from tipo_investimento where nome = 'Renda Fixa'),
 '11222333000181', 'CDB Alfa 110% CDI', 11.50, 1000.00),
((select codigo from tipo_investimento where nome = 'Renda Fixa'),
 '22333444000172', 'Tesouro Selic 2029', 10.75, 150.00),
((select codigo from tipo_investimento where nome = 'Ações'),
 '22333444000172', 'Petro Exemplo (PETX3)', 8.00, 38.50),
((select codigo from tipo_investimento where nome = 'Fundos Imobiliários'),
 '33444555000163', 'FII Shopping Exemplo', 9.20, 95.00);

-- usuários (senha de todos: senha123)
insert into usuario (cpf, nome, senha_hash, nascimento, genero) values
('11111111111', 'Maria Silva', crypt('senha123', gen_salt('bf')), '1995-03-10', 'Feminino'),
('22222222222', 'João Souza',  crypt('senha123', gen_salt('bf')), '1988-07-22', 'Masculino'),
('33333333333', 'Ana Lima',    crypt('senha123', gen_salt('bf')), '2000-11-05', 'Prefiro não informar');

insert into contato_usuario (usuario, tipo, contato) values
('11111111111', (select codigo from tipo_contato where nome = 'Email'), 'maria@email.com'),
('11111111111', (select codigo from tipo_contato where nome = 'Email'), 'maria.trabalho@email.com'),
('11111111111', (select codigo from tipo_contato where nome = 'Telefone'), '53999990001'),
('22222222222', (select codigo from tipo_contato where nome = 'Email'), 'joao@email.com'),
('33333333333', (select codigo from tipo_contato where nome = 'Email'), 'ana@email.com');

-- carteiras (valor = total pago na compra = quantidade x valor unitário da época)
insert into investimento_usuario (usuario, investimento, quantidade, valor, data_inicio, data_fim) values
-- renda fixa: valor investido
('11111111111', (select codigo from investimento where nome = 'CDB Alfa 110% CDI'),     null, 5000.00, '2025-02-10', null),
-- ações e FIIs: quantidade
('11111111111', (select codigo from investimento where nome = 'Petro Exemplo (PETX3)'), 100,  null,    '2025-06-03', null),
('22222222222', (select codigo from investimento where nome = 'FII Shopping Exemplo'),  10,   null,    '2025-04-15', null),
-- renda fixa encerrada
('22222222222', (select codigo from investimento where nome = 'Tesouro Selic 2029'),    null, 300.00,  '2024-09-01', '2025-09-01'),
('33333333333', (select codigo from investimento where nome = 'CDB Alfa 110% CDI'),     null, 3000.00, '2025-08-20', null);
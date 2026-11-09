\c postgres

drop database if exists tca_gd;
create database tca_gd;

\c tca_gd

create table usuario
(
    cpf        char(11)     not null,
    nome       varchar(200) not null,
    nascimento date         not null check (nascimento >= '1900-01-01'),
    genero     char(1)      not null check (genero in ('M', 'F')),
    constraint pk_usuario primary key (cpf),
    constraint ck_usuario_cpf check (cpf ~ '^[0-9]{11}$')
);

create table fornecedor
(
    cnpj char(14)     not null,
    nome varchar(200) not null,
    constraint pk_fornecedor primary key (cnpj),
    constraint ck_fornecedor_cnpj check (cnpj ~ '^[0-9]{14}$')
);

create table tipo_contato
(
    codigo integer generated always as identity,
    nome   varchar(200) not null unique,
    constraint pk_tipo_contato primary key (codigo)
);

create table contato_usuario
(
    codigo   integer generated always as identity,
    usuario  char(11)     not null,
    tipo     integer      not null,
    contato  varchar(200) not null,
    constraint pk_contato_usuario primary key (codigo),
    constraint fk_contato_usuario_usuario foreign key (usuario)
        references usuario(cpf) on delete cascade,
    constraint fk_contato_usuario_tipo foreign key (tipo)
        references tipo_contato(codigo),
    constraint uq_contato_usuario unique (tipo, contato)
);

create table contato_fornecedor
(
    codigo     integer generated always as identity,
    fornecedor char(14)     not null,
    tipo       integer      not null,
    contato    varchar(200) not null,
    constraint pk_contato_fornecedor primary key (codigo),
    constraint fk_contato_fornecedor_fornecedor foreign key (fornecedor)
        references fornecedor(cnpj) on delete cascade,
    constraint fk_contato_fornecedor_tipo foreign key (tipo)
        references tipo_contato(codigo),
    constraint uq_contato_fornecedor unique (tipo, contato)
);

create table tipo_investimento
(
    codigo integer generated always as identity,
    nome   varchar(200) not null unique,
    constraint pk_tipo_investimento primary key (codigo)
);

create table investimento
(
    codigo     integer generated always as identity,
    tipo       integer       not null,
    fornecedor char(14)      not null,
    nome       varchar(200)  not null,
    rendimento numeric(5, 2) not null check (rendimento >= 0),
    valor      numeric(12, 2) not null check (valor > 0),
    constraint pk_investimento primary key (codigo),
    constraint fk_investimento_tipo foreign key (tipo)
        references tipo_investimento(codigo),
    constraint fk_investimento_fornecedor foreign key (fornecedor)
        references fornecedor(cnpj)
);

create table investimento_usuario
(
    codigo       integer generated always as identity,
    usuario      char(11)       not null,
    investimento integer        not null,
    quantidade   numeric(15, 4) not null check (quantidade > 0),
    data_inicio  date           not null default current_date,
    data_fim     date,
    valor        numeric(12, 2) not null check (valor > 0),
    constraint pk_investimento_usuario primary key (codigo),
    constraint fk_inv_usuario_usuario foreign key (usuario)
        references usuario(cpf),
    constraint fk_inv_usuario_investimento foreign key (investimento)
        references investimento(codigo),
    constraint ck_inv_usuario_datas
        check (data_fim is null or data_fim >= data_inicio)
);
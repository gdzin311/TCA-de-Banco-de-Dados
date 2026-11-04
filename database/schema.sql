\c postgres

drop database if exists tca_gd;

create database tca_gd;

\c tca_gd;

create table usuario
(
    cpf char(11) not null, 
    nome varchar(200) not null,
    nascimento date not null check (nascimento < current_date),
    genero char(1) not null default 'M' check (genero in ('M', 'F')),
    primary key (cpf)
);

create table fornecedor
(
    cnpj char(14) not null,
    nome varchar(200) not null,
    primary key (cnpj)
);

create table tipo_contato
(
    codigo integer not null,
    nome varchar(200) not null,
    primary key (codigo)
);

create table contato_usuario
(
    codigo serial,
    usuario char(11) not null,
    tipo integer not null,
    endereco varchar(200) not null,
    foreign key (usuario) references usuario(cpf),
    foreign key (tipo) references tipo_contato(codigo),
    primary key (codigo)
);

create table contato_fornecedor
(
    codigo serial,
    fornecedor char(14) not null,
    tipo integer not null,
    endereco varchar(200) not null,
    foreign key (fornecedor) references fornecedor(cnpj),
    foreign key (tipo) references tipo_contato(codigo),
    primary key (codigo)
);

create table tipo_investimento
(
    codigo integer not null,
    nome varchar(200) not null,
    primary key (codigo)
);

create table investimento
(
    codigo integer not null,
    tipo integer not null,
    fornecedor char(14) not null,
    nome varchar(200),
    rendimento numeric(12, 2),
    valor numeric(12, 2),
    foreign key (fornecedor) references fornecedor(cnpj),
    foreign key (tipo) references tipo_investimento(codigo),
    primary key (codigo)
);

create table investimento_usuario
(
    codigo serial,
    usuario char(11) not null,
    investimento integer not null,
    quantidade numeric(15, 4),
    data_inicio date default current_date,
    data_fim date,
    valor numeric(12, 2),
    foreign key (usuario) references usuario(cpf),
    foreign key (investimento) references investimento(codigo),
    check (data_fim is null or data_fim >= data_inicio),
    primary key (codigo)
);
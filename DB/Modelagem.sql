drop database if exists tca_gd;

create database tca_gd;

\c tca_gd;

create table usuario
{
    cpf char(11) not null, 
	nome varchar(200) not null,
	nascimento date not null check (nascimento < current_date),
	genero char(1) not null default 'M' check (genero in ('M', 'F')),
	primary key (cpf)
};

create table fornecedor
{
    cnpj char(14) not null,
    nome varchar(200) not null
};

create table natureza
{
    nome varchar(200),
    codigo integer not null,
    primary key(codigo)
};

create table tipo
{
    nome varchar(200) not null,
    codigo integer not null,
    primary key (codigo)
};

CREATE TABLE investimento
{
    codigo integer not null,
    fornecedor char(14) not null,
    nome varchar(200),
    rendimento integer,
    valor,
    foreign key (fornecedor) references fornecedor(cnpj),
    primary key (codigo)
};

create table investimento_usuario
{
    usuario char(11) not null,
    investimento integer not null,
    quantidade integer,
    valor 
};
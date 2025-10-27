drop database if exists vizor;
create database vizor;
use vizor;

create table pais(
  id int primary key auto_increment not null,
  nome varchar(200) not null
);

create table estado(
  id int primary key auto_increment not null,
  nome varchar(100) not null,
  fkPais int,
  foreign key (fkPais) references pais(id)
);

create table cidade(
  id int primary key auto_increment not null,
  nome varchar(200) not null,
  fkEstado int,
  foreign key (fkEstado) references estado(id)
);

create table zona(
  id int primary key auto_increment not null,
  zona varchar(10) not null
);

create table endereco (
  id int primary key auto_increment not null,
  rua varchar(300) not null,
  numero int not null,
  cep char(8) not null,
  bairro varchar(100) not null,
  fkZona int,
  fkCidade int,
  foreign key (fkCidade) references cidade(id),
  foreign key (fkZona) references zona(id)
);

create table empresa (
  id int primary key auto_increment not null,
  nome varchar(150) not null,
  cnpj char(14) not null,
  codigoAtivacao varchar(16) not null,
  fkEndereco int null,
  unique (cnpj),
  unique (codigoAtivacao),
  foreign key (fkEndereco) references endereco(id)
);

create table modelo(
  id int primary key auto_increment not null,
  nome varchar(200) not null
);

create table lote (
  id int primary key not null,
  dataFabricacao date not null,
  modelo varchar(40) not null,
  fkEmpresa int,
  fkModelo int,
  foreign key (fkModelo) references modelo(id),
  foreign key (fkEmpresa) references empresa(id)
);

create table miniComputador (
  id int primary key auto_increment not null,
  codigo VARCHAR(40),
  fkEndereco int,
  fkLote int,
  foreign key (fkEndereco) references endereco(id),
  foreign key (fkLote) references lote(id)
);

create table cargo(
  id int primary key auto_increment not null,
  titulo varchar(100) not null
);

create table usuario (
  id int primary key auto_increment not null,
  nome varchar(150) not null,
  email varchar(150) not null,
  senha varchar(150) not null,
  cpf char(11),
  telefone char(11),
  fkEmpresa int,
  fkCargo int,
  unique (email),
  unique (cpf),
  foreign key (fkEmpresa) references empresa(id),
  foreign key (fkCargo) references cargo(id)
);

create table componente(
  id int primary key auto_increment not null,
  nome varchar(50) not null,
  unidadeMedida varchar(10) not null,
  unique (nome, unidadeMedida)
);



create table parametro(
  id int primary key auto_increment not null,
  fkModelo int,
  fkComponente int,
  fkMiniComputador int,
  valorParametro decimal(5,2) not null,
  foreign key (fkModelo) references modelo(id),
  foreign key (fkComponente) references componente(id),
  foreign key (fkMiniComputador) references miniComputador(id),
  unique (fkModelo, fkComponente)
);

create table alertas (
  id int primary key auto_increment not null,
  fkParametro int,
  foreign key (fkParametro) references parametro(id)
);

insert into pais (nome) values ('Brasil');
insert into estado (nome, fkPais) values ('São Paulo', 1);
insert into cidade (nome, fkEstado) values ('São Paulo', 1);
insert into zona (zona) values ('Sul'), ('Norte'), ('Leste'), ('Oeste');

insert into endereco (rua, numero, cep, bairro, fkZona, fkCidade) values
('Rua das Flores', 123, '01001000', 'Centro', 1, 1),
('Avenida Paulista', 456, '01311000', 'Bela Vista', 2, 1),
('Rua Central', 789, '02020202', 'Jardins', 3, 1);

INSERT INTO empresa (nome, cnpj, codigoAtivacao, fkEndereco) VALUES
('Tech Solutions', '12345678000190', 'A1234', NULL),
('Smart Innovations', '11122233000177', 'C9012', NULL);

INSERT INTO lote(id, dataFabricacao, modelo, fkEmpresa) VALUES
(1008234, '2025-01-15', 'MiniPC X100', 1),
(2204102, '2025-03-10', 'MiniPC S300', 2);

INSERT INTO miniComputador (codigo, fkLote, fkEndereco) VALUES
('COD001', 1008234, 1), 
('COD002', 1008234, 1), 
('COD003', 1008234, 1), 
('COD004', 2204102, 2), 
('COD005', 2204102, 3);

INSERT INTO componente (nome, unidadeMedida) VALUES
('CPU', '%'),
('RAM', '%'),
('Disco', '%');

INSERT INTO modelo(nome) VALUES
('IntelI5');
/*
INSERT INTO parametro (fkModelo, fkComponente, valorParametro) VALUES
(1, 1, 85),
(1, 2, 85),
(1, 3, 85);
*/



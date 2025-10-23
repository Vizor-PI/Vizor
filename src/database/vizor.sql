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

create table lote (
  id int primary key not null,
  dataFabricacao date not null,
  modelo varchar(40) not null,
  fkEmpresa int,
  foreign key (fkEmpresa) references empresa(id)
);

create table miniComputador (
  id int primary key auto_increment not null,
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

create table modelo(
  id int primary key auto_increment not null,
  nome varchar(200) not null
);

create table parametro(
  id int primary key auto_increment not null,
  fkModelo int,
  fkComponente int,
  valorParametro decimal(5,2) not null,
  foreign key (fkModelo) references modelo(id),
  foreign key (fkComponente) references componente(id),
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

insert into empresa (nome, cnpj, codigoAtivacao, fkEndereco) values
('Tech Solutions', '12345678000190', 'A1234X9M2Q7K', 1),
('Green Energy', '98765432000155', 'B5678Y1N4R0P', 2),
('Smart Innovations', '11122233000177', 'C9012T6L8V3D', 3);

insert into cargo(titulo) values
('Administrador'),
('Gestor de produtos'),
('Engenheiro de qualidade de produtos');

insert into usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) values
('Guilherme Leon', 'guilherme@example.com', 'senha123', '12345678901', '11999998888', 1, 1),
('Ana Silva', 'ana@example.com', 'senha456', '10987654321', '11988887777', 2, 2),
('Carlos Pereira', 'carlos@example.com', 'senha789', '11223344556', '11977776666', 3, 3);

insert into lote(id, dataFabricacao, modelo, fkEmpresa) values
(1008234, '2025-01-15', 'MiniPC X100', 1),
(1005134, '2025-02-20', 'MiniPC G200', 2),
(2204102, '2025-03-10', 'MiniPC S300', 3);

insert into miniComputador (fkLote, fkEndereco) values
(1008234, 2),
(1005134, 1),
(2204102, 3);

insert into componente (nome, unidadeMedida) values
('cpu', '%'),
('ram', '%'),
('disco', '%'),
('disco', 'gb'),
('ram', 'gb');

insert into modelo (nome) values ('IntelI5');

insert into parametro (fkModelo, fkComponente, valorParametro) values
(1, 1, 85.00),
(1, 2, 85.00),
(1, 3, 85.00);

insert into alertas (fkParametro) values
(1),(2),(3);
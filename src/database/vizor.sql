-- cria a database
create database vizor;
use vizor;

-- cria as tabelas
create table empresa (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome varchar(150) NOT NULL,
    cnpj varchar(14) NOT NULL
);

create table usuario (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    nome varchar(150) NOT NULL,
    email varchar(150) NOT NULL,
    senha varchar(150) NOT NULL,
    cpf char(11),
    telefone char(11),
    fkEmpresa INT,
    foreign key (fkEmpresa) references empresa(id)
);

create table miniPc (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkEmpresa INT,
    foreign key (fkEmpresa) references empresa(id)
);

create table endereco (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
	rua varchar(300) NOT NULL,
    numero INT NOT NULL,
    cep CHAR(8) NOT NULL,
    fkMinipc INT,
    foreign key (fkMinipc) references miniPc(id)
);

create table alertas (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkMinipc INT,
    foreign key (fkMinipc) references miniPc(id)
);

-- inserts para teste de login
insert into empresa (nome, cnpj) 
	values ('Empresa A', '12345678000190');

insert into usuario (nome, email, senha, fkEmpresa) 
	values ('asd', 'teste@teste.com', '123', 1);
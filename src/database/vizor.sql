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


-- Inserts


-- EMPRESA
INSERT INTO empresa (nome, cnpj) VALUES 
('TechCloud Solutions', '12345678000199'),
('Pipeline Systems', '98765432000155');

-- USUÁRIO
INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa) VALUES
('João Silva', 'joao.silva@techcloud.com', 'senha123', '12345678901', '11987654321', 1),
('Maria Oliveira', 'maria.oliveira@pipeline.com', 'segredo456', '10987654321', '11912345678', 2);

-- MINI PC
INSERT INTO miniPc (fkEmpresa) VALUES
(1),
(2);

-- ENDEREÇO
INSERT INTO endereco (rua, numero, cep, fkMinipc) VALUES
('Rua das Flores', 123, '04567890', 1),
('Avenida Paulista', 2000, '01310940', 2);

-- ALERTAS
INSERT INTO alertas (fkMinipc) VALUES
(1),
(2);


SELECT us.nome, us.email, us.telefone, us.email, us.cpf as CPF, em.nome
FROM usuario AS us
INNER JOIN empresa AS em on us.fkEmpresa = em.id WHERE us.id = 1;
    
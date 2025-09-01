-- Cria a database
DROP DATABASE IF EXISTS vizor;
CREATE DATABASE IF NOT EXISTS vizor;
USE vizor;

-- =========================
-- TABELAS BASE
-- =========================
CREATE TABLE pais(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(200) NOT NULL
);

CREATE TABLE estado(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    fkPais INT,
    FOREIGN KEY (fkPais) REFERENCES pais(id)
);

CREATE TABLE cidade(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    fkEstado INT,
    FOREIGN KEY (fkEstado) REFERENCES estado(id)
);

CREATE TABLE zona(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    zona VARCHAR(10) NOT NULL
);

-- =========================
-- EMPRESA E ESTRUTURA
-- =========================
CREATE TABLE empresa (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    codigoAtivacao VARCHAR(5) NOT NULL,
    fkEndereco INT NULL
);

CREATE TABLE miniComputador (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkEmpresa INT,
    fkEndereco INT,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(id),
    FOREIGN KEY (fkEndereco) REFERENCES empresa(id)
);

CREATE TABLE endereco (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    rua VARCHAR(300) NOT NULL,
    numero INT NOT NULL,
    cep CHAR(8) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    fkZona INT,
    fkCidade INT,
    fkMinipc INT,
    FOREIGN KEY (fkCidade) REFERENCES cidade(id),
    FOREIGN KEY (fkZona) REFERENCES zona(id),
    FOREIGN KEY (fkMinipc) REFERENCES miniComputador(id)
);

-- agora sim podemos adicionar a FK da empresa para endereço
ALTER TABLE empresa
    ADD CONSTRAINT fk_empresa_endereco FOREIGN KEY (fkEndereco) REFERENCES endereco(id);

-- =========================
-- USUÁRIOS E CARGOS
-- =========================
CREATE TABLE cargo(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    titulo VARCHAR(100) NOT NULL
);

CREATE TABLE usuario (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(150) NOT NULL,
    cpf CHAR(11),
    telefone CHAR(11),
    fkEmpresa INT,
    fkCargo INT,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(id),
    FOREIGN KEY (fkCargo) REFERENCES cargo(id)
);

-- =========================
-- COMPONENTES E ALERTAS
-- =========================
CREATE TABLE componente(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    unidadeMedida VARCHAR(10)
);

CREATE TABLE parametro(
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkMinipc INT,
    fkComponente INT,
    qtdAlerta INT,
    FOREIGN KEY (fkMinipc) REFERENCES miniComputador(id),
    FOREIGN KEY (fkComponente) REFERENCES componente(id)
);

CREATE TABLE alertas (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkMinipc INT,
    FOREIGN KEY (fkMinipc) REFERENCES miniComputador(id)
);

-- =========================
-- INSERTS DE TESTE
-- =========================
INSERT INTO empresa (nome, cnpj, codigoAtivacao, fkEndereco) VALUES
('Tech Solutions', '12345678000190', 'A1234', NULL),
('Green Energy', '98765432000155', 'B5678', NULL),
('Smart Innovations', '11122233000177', 'C9012', NULL);

INSERT INTO cargo(titulo) VALUES
('Gestor de produtos'),
('Engenheiro de qualidade de produtos'),
('Q&A'),
('Administrador do site'),
('Analista de produção');

INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) VALUES
('Guilherme Leon', 'guilherme@example.com', 'senha123', '12345678901', '11999998888', 1, 1),
('Ana Silva', 'ana@example.com', 'senha456', '10987654321', '11988887777', 2, 2),
('Carlos Pereira', 'carlos@example.com', 'senha789', '11223344556', '11977776666', 3, 3);

INSERT INTO miniComputador (fkEmpresa, fkEndereco) VALUES
(1, NULL),
(2, NULL),
(3, NULL);

INSERT INTO endereco (rua, numero, cep, bairro, fkZona, fkCidade, fkMinipc) VALUES
('Rua das Flores', 123, '01001000', 'Centro', NULL, NULL, 1),
('Avenida Paulista', 456, '01311000', 'Bela Vista', NULL, NULL, 2),
('Rua Central', 789, '02020202', 'Jardins', NULL, NULL, 3);

INSERT INTO alertas (fkMinipc) VALUES
(1),
(2),
(3);

-- =========================
-- CONSULTAS
-- =========================
SELECT 
    us.nome, 
    us.email, 
    us.telefone, 
    us.cpf AS CPF, 
    em.nome AS Empresa
FROM usuario AS us
INNER JOIN empresa AS em 
    ON us.fkEmpresa = em.id 
WHERE us.id = 1;

SELECT id AS IdEmpresa, nome AS NomeEmpresa, codigoAtivacao AS Codigo 
FROM empresa;

SELECT * FROM empresa;
SELECT * FROM usuario;

INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) 
VALUES (
    'Joao', 
    'joao@gmail.com', 
    '123456', 
    '45231313111', 
    '11988886666', 
    (SELECT id FROM empresa WHERE codigoAtivacao = 'A1234'),
    1
);

SELECT * FROM usuario;

SELECT us.nome as NomeUsuario, us.email as EmailUsuario, us.telefone as Telefone, us.cpf as CPF, us.senha as SenhaUsuario 
FROM usuario as us;


SELECT * FROM usuario;
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

CREATE TABLE lote (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    dataFabricacao DATE NOT NULL,
    modelo VARCHAR(40) NOT NULL,
    fkEmpresa INT,
    FOREIGN KEY (fkEmpresa) REFERENCES empresa(id)
);

CREATE TABLE endereco (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    rua VARCHAR(300) NOT NULL,
    numero INT NOT NULL,
    cep CHAR(8) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    fkZona INT,
    fkCidade INT,
    FOREIGN KEY (fkCidade) REFERENCES cidade(id),
    FOREIGN KEY (fkZona) REFERENCES zona(id)
);

CREATE TABLE miniComputador (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkEndereco INT,
    fkLote INT,
    FOREIGN KEY (fkEndereco) REFERENCES endereco(id),
    FOREIGN KEY (fkLote) REFERENCES lote(id)
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
    email VARCHAR(150) UNIQUE NOT NULL,
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
    valorParametro INT,
    FOREIGN KEY (fkMinipc) REFERENCES miniComputador(id),
    FOREIGN KEY (fkComponente) REFERENCES componente(id)
);

CREATE TABLE alertas (
    id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    fkParametro INT,
    FOREIGN KEY (fkParametro) REFERENCES parametro(id)
);

-- =========================
-- INSERTS DE TESTE
-- =========================
INSERT INTO empresa (nome, cnpj, codigoAtivacao, fkEndereco) VALUES
('Tech Solutions', '12345678000190', 'A1234', NULL),
('Green Energy', '98765432000155', 'B5678', NULL),
('Smart Innovations', '11122233000177', 'C9012', NULL);

INSERT INTO endereco (rua, numero, cep, bairro, fkZona, fkCidade) VALUES
('Rua das Flores', 123, '01001000', 'Centro', NULL, NULL),
('Avenida Paulista', 456, '01311000', 'Bela Vista', NULL, NULL),
('Rua Central', 789, '02020202', 'Jardins', NULL, NULL);

INSERT INTO cargo(titulo) VALUES
('Administrador'),
('Gestor de produtos'),
('Engenheiro de qualidade de produtos');

INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) VALUES
('Guilherme Leon', 'guilherme@example.com', 'senha123', '12345678901', '11999998888', 1, 1),
('Ana Silva', 'ana@example.com', 'senha456', '10987654321', '11988887777', 2, 2),
('Carlos Pereira', 'carlos@example.com', 'senha789', '11223344556', '11977776666', 3, 3);

INSERT INTO lote(dataFabricacao, modelo, fkEmpresa) VALUES
('2025-01-15', 'MiniPC X100', 1),
('2025-02-20', 'MiniPC G200', 2),
('2025-03-10', 'MiniPC S300', 3);

INSERT INTO miniComputador (fklote, fkEndereco) VALUES
(1, 2),
(2, 1),
(3, 3);

INSERT INTO componente (nome, unidadeMedida) VALUES
('CPU', '%'),
('RAM', '%'),
('Disco', '%');

INSERT INTO parametro (fkMinipc, fkComponente, valorParametro) VALUES
(1, 1, 85), 
(1, 2, 85),
(1, 3, 85); 

INSERT INTO alertas (fkParametro) VALUES
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

SELECT * FROM miniComputador;

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

SELECT * FROM parametro;

SELECT * FROM usuario;

SELECT us.nome as NomeUsuario, us.email as EmailUsuario, us.telefone as Telefone, us.cpf as CPF, us.senha as SenhaUsuario 
FROM usuario as us;

SELECT * FROM usuario;
SELECT * FROM empresa;

SELECT us.id, us.nome, us.email, empresa.codigoAtivacao, us.fkcargo FROM usuario AS us INNER JOIN empresa ON empresa.id = us.fkEmpresa WHERE email = email AND senha = senha;

SELECT
    e.id AS IdEmpresa,
    e.nome AS NomeEmpresa,
    e.cnpj AS CNPJ,
    e.codigoAtivacao AS CodigoAtivacao,
    en.rua,
    en.numero,
    en.bairro,
    en.cep,
    c.nome AS Cidade,
    es.nome AS Estado
FROM
    empresa AS e
INNER JOIN
    endereco AS en ON e.fkEndereco = en.id
INNER JOIN
    cidade AS c ON en.fkCidade = c.id
INNER JOIN
    estado AS es ON c.fkEstado = es.id;
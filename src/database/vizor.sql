CREATE DATABASE IF NOT EXISTS vizor;
USE vizor;

-- localização


CREATE TABLE pais (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(200) NOT NULL
);

CREATE TABLE estado (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  fkPais INT,
  FOREIGN KEY (fkPais) REFERENCES pais(id)
);

CREATE TABLE cidade (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(200) NOT NULL,
  fkEstado INT,
  FOREIGN KEY (fkEstado) REFERENCES estado(id)
);

CREATE TABLE zona (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  zona VARCHAR(10) NOT NULL
);

CREATE TABLE endereco (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  rua VARCHAR(300) NOT NULL,
  numero INT NOT NULL,
  cep CHAR(8) NOT NULL,
  bairro VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL, 
  longitude DECIMAL(11, 8) NOT NULL,
  fkZona INT,
  fkCidade INT,
  FOREIGN KEY (fkCidade) REFERENCES cidade(id),
  FOREIGN KEY (fkZona) REFERENCES zona(id)
);

-- parte adm


CREATE TABLE empresa (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(150) NOT NULL,
  cnpj CHAR(14) NOT NULL,
  codigoAtivacao VARCHAR(16) NOT NULL,
  fkEndereco INT NULL,
  UNIQUE (cnpj),
  UNIQUE (codigoAtivacao),
  FOREIGN KEY (fkEndereco) REFERENCES endereco(id)
);

CREATE TABLE cargo (
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
  UNIQUE (email),
  UNIQUE (cpf),
  FOREIGN KEY (fkEmpresa) REFERENCES empresa(id),
  FOREIGN KEY (fkCargo) REFERENCES cargo(id)
);

-- hardware

CREATE TABLE lote (
  id INT PRIMARY KEY NOT NULL,
  dataFabricacao DATE NOT NULL,
  modelo VARCHAR(40) NOT NULL,
  fkEmpresa INT,
  FOREIGN KEY (fkEmpresa) REFERENCES empresa(id)
);

CREATE TABLE miniComputador (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  fkEndereco INT,
  fkLote INT,
  FOREIGN KEY (fkEndereco) REFERENCES endereco(id),
  FOREIGN KEY (fkLote) REFERENCES lote(id)
);

-- componetes
CREATE TABLE componente (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(50) NOT NULL,
  unidadeMedida VARCHAR(10) NOT NULL,
  UNIQUE (nome, unidadeMedida)
);

CREATE TABLE modelo (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  nome VARCHAR(200) NOT NULL
);

-- parametros
CREATE TABLE parametro (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  fkModelo INT,
  fkComponente INT,
  valorParametro DECIMAL(5,2) NOT NULL,
  FOREIGN KEY (fkModelo) REFERENCES modelo(id),
  FOREIGN KEY (fkComponente) REFERENCES componente(id),
  UNIQUE (fkModelo, fkComponente)
);

CREATE TABLE alertas (
  id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  fkParametro INT,
  FOREIGN KEY (fkParametro) REFERENCES parametro(id)
);

--inserts

INSERT INTO pais (nome) VALUES ('Brasil');
INSERT INTO estado (nome, fkPais) VALUES ('São Paulo', 1);
INSERT INTO cidade (nome, fkEstado) VALUES ('São Paulo', 1);
INSERT INTO zona (zona) VALUES ('Sul'), ('Norte'), ('Leste'), ('Oeste');

INSERT INTO endereco (rua, numero, cep, bairro, latitude, longitude, fkZona, fkCidade) VALUES
('Rua das Flores', 123, '01001000', 'Centro', -23.558, -46.660, 1, 1),
('Avenida Paulista', 456, '01311000', 'Bela Vista', -23.561, -46.656, 2, 1),
('Rua Central', 789, '02020202', 'Jardins', -23.564, -46.652, 3, 1);

INSERT INTO empresa (nome, cnpj, codigoAtivacao, fkEndereco) VALUES
('Tech Solutions', '12345678000190', 'A1234X9M2Q7K', 1),
('Green Energy', '98765432000155', 'B5678Y1N4R0P', 2),
('Smart Innovations', '11122233000177', 'C9012T6L8V3D', 3);

INSERT INTO cargo(titulo) VALUES
('Administrador'),
('Gestor de produtos'),
('Engenheiro de qualidade de produtos');

INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa, fkCargo) VALUES
('Guilherme Leon', 'guilherme@example.com', 'senha123', '12345678901', '11999998888', 1, 1),
('Ana Silva', 'ana@example.com', 'senha456', '10987654321', '11988887777', 2, 2),
('Carlos Pereira', 'carlos@example.com', 'senha789', '11223344556', '11977776666', 3, 3);

INSERT INTO lote(id, dataFabricacao, modelo, fkEmpresa) VALUES
(1008234, '2025-01-15', 'MiniPC X100', 1),
(1005134, '2025-02-20', 'MiniPC G200', 2),
(2204102, '2025-03-10', 'MiniPC S300', 3);

INSERT INTO miniComputador (fkLote, fkEndereco) VALUES
(1008234, 2),
(1005134, 1),
(2204102, 3);

INSERT INTO componente (nome, unidadeMedida) VALUES
('cpu', '%'),
('ram', '%'),
('disco', '%'),
('disco', 'gb'),
('ram', 'gb');

INSERT INTO modelo (nome) VALUES ('IntelI5');

INSERT INTO parametro (fkModelo, fkComponente, valorParametro) VALUES
(1, 1, 85.00),
(1, 2, 85.00),
(1, 3, 85.00);

INSERT INTO alertas (fkParametro) VALUES
(1),(2),(3);

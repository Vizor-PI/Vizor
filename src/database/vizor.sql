-- cria a database
create database vizor;
use vizor;

-- cria as tabelas
-- Inserindo empresas
INSERT INTO empresa (nome, cnpj, codigoAtivacao) VALUES
('Tech Solutions', '12345678000190', 'A1234'),
('Green Energy', '98765432000155', 'B5678'),
('Smart Innovations', '11122233000177', 'C9012');

-- Inserindo usuários
INSERT INTO usuario (nome, email, senha, cpf, telefone, fkEmpresa) VALUES
('Guilherme Leon', 'guilherme@example.com', 'senha123', '12345678901', '11999998888', 1),
('Ana Silva', 'ana@example.com', 'senha456', '10987654321', '11988887777', 2),
('Carlos Pereira', 'carlos@example.com', 'senha789', '11223344556', '11977776666', 3);

-- Inserindo miniPcs
INSERT INTO miniPc (fkEmpresa) VALUES
(1),
(2),
(3);

-- Inserindo endereços
INSERT INTO endereco (rua, numero, cep, fkMinipc) VALUES
('Rua das Flores', 123, '01001000', 1),
('Avenida Paulista', 456, '01311000', 2),
('Rua Central', 789, '02020202', 3);

-- Inserindo alertas
INSERT INTO alertas (fkMinipc) VALUES
(1),
(2),
(3);


SELECT us.nome, us.email, us.telefone, us.email, us.cpf as CPF, em.nome
FROM usuario AS us
INNER JOIN empresa AS em on us.fkEmpresa = em.id WHERE us.id = 1;
    
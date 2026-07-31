-- V8: Seed data

INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@construformas.es', '$2a$10$Yk9VHLGW0cZCKm76Xc54yumg24UoYLO6u3/q4EhMbtCho1nyQ.HU6', 'ADMIN');

INSERT INTO payment_methods (name) VALUES
('Transferencia Bancaria'),
('Efectivo'),
('Cheque'),
('Tarjeta de Crédito'),
('Tarjeta de Débito');

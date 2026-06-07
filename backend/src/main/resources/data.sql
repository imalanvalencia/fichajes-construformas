-- Initial admin user for Construformas
-- Only runs if usuarios table is empty
INSERT INTO usuarios (nombre, email, password_hash, rol, activo, created_at)
SELECT 'Administrador', 'admin@construformas.com', '$2a$10$dummy_hash_for_initial_setup', 'ADMIN', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@construformas.com');

-- Initial admin user for Construformas
-- Only runs if users table is empty
INSERT INTO users (name, email, password, role, active, created_at)
SELECT 'Admin', 'admin@construformas.com', '$2a$10$dummy_hash_for_initial_setup', 'ADMIN', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@construformas.com');

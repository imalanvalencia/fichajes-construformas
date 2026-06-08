-- ============================================
-- SEED DATA FOR DEVELOPMENT ENVIRONMENT
-- Password for all users: admin123
-- BCrypt hash: $2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq
-- ============================================

-- Admin users
INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Alan Admin', 'alan@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'ADMIN', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'ADMIN',
  active = true;

INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Maria Admin', 'maria@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'ADMIN', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'ADMIN',
  active = true;

-- Operator users
INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Juan Perez', 'juan@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = true;

INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Carlos Rodriguez', 'carlos@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = true;

INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Ana Garcia', 'ana@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = true;

INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Pedro Martinez', 'pedro@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = true;

INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Laura Sanchez', 'laura@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', true, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = true;

-- Inactive user (for testing deactivation)
INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Roberto Inactivo', 'roberto@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'OPERATOR', false, NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = 'OPERATOR',
  active = false;

-- ============================================
-- TEST PROJECTS (Madrid area coordinates)
-- ============================================

INSERT INTO projects (name, address, latitude, longitude, allowed_radius_meters, active, created_at)
VALUES ('Edificio Centro', 'Calle Gran Via 28, Madrid', 40.4200, -3.7025, 50, true, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO projects (name, address, latitude, longitude, allowed_radius_meters, active, created_at)
VALUES ('Residencia Norte', 'Calle Alcala 100, Madrid', 40.4280, -3.6800, 75, true, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO projects (name, address, latitude, longitude, allowed_radius_meters, active, created_at)
VALUES ('Oficinas Sur', 'Calle Mayor 50, Madrid', 40.4115, -3.7080, 100, true, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO projects (name, address, latitude, longitude, allowed_radius_meters, active, created_at)
VALUES ('Nave Industrial', 'Poligono Este, Madrid', 40.4350, -3.6500, 150, true, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO projects (name, address, latitude, longitude, allowed_radius_meters, active, created_at)
VALUES ('Obra Pausada', 'Calle Antigua 10, Madrid', 40.4050, -3.7150, 50, false, NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name);

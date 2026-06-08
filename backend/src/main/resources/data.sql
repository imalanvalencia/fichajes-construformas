-- Initial admin user for Construformas
-- Uses ON DUPLICATE KEY to update all fields if user already exists
INSERT INTO users (name, email, password, role, active, created_at)
VALUES ('Admin', 'admin@construformas.com', '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq', 'ADMIN', true, NOW())
ON DUPLICATE KEY UPDATE
  password = '$2a$10$7qw5O/RSzPmjih484PMelu9LEWUfo4nyh/c8Ksk/lRTsWXIXr0fDq',
  role = 'ADMIN',
  active = true;

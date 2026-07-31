-- V9: Roles, user_roles join table, availability, and current_project_id

-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- Seed ADMIN and OPERATOR roles
INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator with full access'),
    ('OPERATOR', 'Field operator with limited access');

-- Create user_roles join table
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Migrate existing role column data to user_roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u JOIN roles r ON u.role = r.name;

-- Add availability and current_project_id columns to users
ALTER TABLE users ADD COLUMN availability VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE';
ALTER TABLE users ADD COLUMN current_project_id BIGINT REFERENCES projects(id);

-- Drop the old role column
ALTER TABLE users DROP COLUMN role;

-- V3: Create clock_entries table for Construformas clock-in system
CREATE TABLE clock_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    clock_type VARCHAR(20) NOT NULL,
    user_latitude DOUBLE NOT NULL,
    user_longitude DOUBLE NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_clock_entries_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_clock_entries_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

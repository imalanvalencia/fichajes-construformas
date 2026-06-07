-- V4: Create clock_corrections table for manual correction requests
CREATE TABLE clock_corrections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    original_entry_id BIGINT,
    correction_date DATE NOT NULL,
    original_clock_type VARCHAR(20) NOT NULL,
    corrected_time DATETIME NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT,
    reviewed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clock_corrections_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_clock_corrections_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_clock_corrections_entry FOREIGN KEY (original_entry_id) REFERENCES clock_entries(id),
    CONSTRAINT fk_clock_corrections_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

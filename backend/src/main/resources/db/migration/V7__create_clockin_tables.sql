-- V7: Clock entries and corrections

CREATE TABLE clock_entries (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    project_id BIGINT NOT NULL REFERENCES projects(id),
    clock_type VARCHAR(20) NOT NULL,
    user_latitude DOUBLE PRECISION NOT NULL,
    user_longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX idx_clock_entries_user ON clock_entries(user_id);
CREATE INDEX idx_clock_entries_project ON clock_entries(project_id);
CREATE INDEX idx_clock_entries_timestamp ON clock_entries(timestamp);

CREATE TABLE clock_corrections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    project_id BIGINT NOT NULL REFERENCES projects(id),
    original_entry_id BIGINT REFERENCES clock_entries(id),
    correction_date DATE NOT NULL,
    original_clock_type VARCHAR(20) NOT NULL,
    corrected_time TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clock_corrections_user ON clock_corrections(user_id);
CREATE INDEX idx_clock_corrections_status ON clock_corrections(status);

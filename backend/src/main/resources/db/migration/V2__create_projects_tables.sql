-- V2: Projects, phases, photos, progress

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    allowed_radius_meters INT NOT NULL DEFAULT 50,
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

CREATE TABLE project_phases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_num INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_project_phases_project ON project_phases(project_id);

CREATE TABLE work_photos (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    phase_id BIGINT REFERENCES project_phases(id),
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    photo_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_photos_project ON work_photos(project_id);

CREATE TABLE work_progress (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    phase_id BIGINT REFERENCES project_phases(id),
    reported_by BIGINT NOT NULL REFERENCES users(id),
    progress_date DATE NOT NULL,
    percentage INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_progress_project ON work_progress(project_id);

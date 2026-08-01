-- V5: Payments

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT REFERENCES invoices(id),
    project_id BIGINT NOT NULL REFERENCES projects(id),
    client_id BIGINT NOT NULL REFERENCES clients(id),
    payment_method_id BIGINT NOT NULL REFERENCES payment_methods(id),
    amount NUMERIC(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    reference VARCHAR(255),
    type VARCHAR(30) NOT NULL,
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_type ON payments(type);

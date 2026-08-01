-- V4: Invoices, invoice items, rectifying invoices, payment methods

CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    client_id BIGINT NOT NULL REFERENCES clients(id),
    invoice_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    issued_date DATE,
    due_date DATE,
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_invoices_number UNIQUE (invoice_number)
);

CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    order_num INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

CREATE TABLE rectifying_invoices (
    id BIGSERIAL PRIMARY KEY,
    original_invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    rectifying_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    subtotal NUMERIC(12,2) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL,
    tax_amount NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    reason TEXT NOT NULL,
    issued_date DATE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_rectifying_number UNIQUE (rectifying_number)
);

CREATE INDEX idx_rectifying_original ON rectifying_invoices(original_invoice_id);

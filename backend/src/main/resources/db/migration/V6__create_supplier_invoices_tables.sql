-- V6: Supplier invoices and items

CREATE TABLE supplier_invoices (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    project_id BIGINT REFERENCES projects(id),
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 21.00,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    notes TEXT,
    file_path VARCHAR(500),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX idx_supplier_invoices_project ON supplier_invoices(project_id);
CREATE INDEX idx_supplier_invoices_status ON supplier_invoices(status);

CREATE TABLE supplier_invoice_items (
    id BIGSERIAL PRIMARY KEY,
    supplier_invoice_id BIGINT NOT NULL REFERENCES supplier_invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_supplier_inv_items_invoice ON supplier_invoice_items(supplier_invoice_id);

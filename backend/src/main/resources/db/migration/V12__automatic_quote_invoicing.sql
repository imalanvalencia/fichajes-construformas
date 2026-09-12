-- V12: Automatic quote invoicing persistence contract

ALTER TABLE budgets
    ADD COLUMN deleted_at TIMESTAMP,
    ADD COLUMN deleted_by BIGINT REFERENCES users(id);

ALTER TABLE invoices
    ADD COLUMN source_budget_id BIGINT REFERENCES budgets(id),
    ADD COLUMN deleted_at TIMESTAMP,
    ADD COLUMN deleted_by BIGINT REFERENCES users(id),
    ADD CONSTRAINT uk_invoices_source_budget UNIQUE (source_budget_id);

CREATE INDEX idx_budgets_active ON budgets(id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_active ON invoices(id) WHERE deleted_at IS NULL;

CREATE TABLE invoice_year_sequences (
    year INT PRIMARY KEY,
    last_value INT NOT NULL CHECK (last_value > 0)
);

CREATE TABLE document_lifecycle_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    budget_id BIGINT REFERENCES budgets(id),
    invoice_id BIGINT REFERENCES invoices(id),
    actor_id BIGINT NOT NULL REFERENCES users(id),
    occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_lifecycle_events_budget ON document_lifecycle_events(budget_id);
CREATE INDEX idx_document_lifecycle_events_invoice ON document_lifecycle_events(invoice_id);

CREATE OR REPLACE FUNCTION reject_document_lifecycle_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Document lifecycle events are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_lifecycle_events_immutable
    BEFORE UPDATE OR DELETE ON document_lifecycle_events
    FOR EACH ROW
    EXECUTE FUNCTION reject_document_lifecycle_event_mutation();

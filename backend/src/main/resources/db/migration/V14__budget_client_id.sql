-- V14: Persist budgets.client_id (Budget.client mapped "client _id" with a space since 1c4c815
-- and no migration ever created the column, so ddl-auto=validate blocked boot on PostgreSQL).
-- Backfill existing rows from their project before enforcing NOT NULL.
ALTER TABLE budgets
    ADD COLUMN client_id BIGINT REFERENCES clients(id);

UPDATE budgets b
SET client_id = p.client_id
FROM projects p
WHERE b.project_id = p.id
  AND b.client_id IS NULL;

ALTER TABLE budgets
    ALTER COLUMN client_id SET NOT NULL;

CREATE INDEX idx_budgets_client ON budgets (client_id);

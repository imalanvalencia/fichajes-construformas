-- V13: Persist includes_iva flag on budgets (PDF/totals rendering)
ALTER TABLE budgets
    ADD COLUMN includes_iva BOOLEAN NOT NULL DEFAULT FALSE;

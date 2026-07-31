-- V3: Budgets, items, discounts, annexes

CREATE TABLE budgets (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    original_budget_id BIGINT REFERENCES budgets(id),
    version INT NOT NULL DEFAULT 1,
    budget_type VARCHAR(30) NOT NULL DEFAULT 'ORIGINAL',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    payment_terms TEXT,
    terms_conditions TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_project ON budgets(project_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_original ON budgets(original_budget_id);

CREATE TABLE budget_items (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    zone VARCHAR(100),
    description VARCHAR(500) NOT NULL,
    unit VARCHAR(50),
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
    order_num INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_items_budget ON budget_items(budget_id);

CREATE TABLE budget_discounts (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_discounts_budget ON budget_discounts(budget_id);

CREATE TABLE budget_annexes (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id),
    description TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_annexes_budget ON budget_annexes(budget_id);

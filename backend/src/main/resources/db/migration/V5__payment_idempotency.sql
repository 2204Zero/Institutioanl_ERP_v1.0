-- Migration V5: Add idempotency support for payment recording
ALTER TABLE finance_payment ADD COLUMN idempotency_key VARCHAR(255);
ALTER TABLE finance_payment ADD CONSTRAINT uq_finance_payment_idempotency_key UNIQUE (idempotency_key);
ALTER TABLE finance_payment ADD COLUMN request_hash VARCHAR(255);

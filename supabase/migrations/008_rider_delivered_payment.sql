-- Rider marks delivered + payment received
-- Run after 007

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMPTZ;
COMMENT ON COLUMN orders.payment_received_at IS 'When rider confirmed payment received (from rider app)';

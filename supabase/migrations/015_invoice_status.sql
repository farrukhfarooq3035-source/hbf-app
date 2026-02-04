-- Additional invoice metadata for orders

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS last_invoice_edit_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.invoice_status IS 'draft/issued/void etc – controls invoice workflow';
COMMENT ON COLUMN orders.last_invoice_edit_at IS 'Timestamp of last invoice/order item edit';

-- For any existing orders where receipt already issued, mark status accordingly
UPDATE orders
SET invoice_status = 'issued'
WHERE receipt_issued_at IS NOT NULL
  AND invoice_status = 'draft';

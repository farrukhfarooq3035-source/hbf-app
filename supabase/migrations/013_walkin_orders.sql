-- Walk-in / dine-in support: extended order metadata + payment ledger

-- Order level metadata -------------------------------------------------------
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_channel TEXT NOT NULL DEFAULT 'online'
    CHECK (order_channel IN ('online', 'walk_in', 'dine_in', 'takeaway')),
  ADD COLUMN IF NOT EXISTS service_mode TEXT
    CHECK (service_mode IN ('delivery', 'pickup', 'dine_in')),
  ADD COLUMN IF NOT EXISTS table_number TEXT,
  ADD COLUMN IF NOT EXISTS token_number TEXT,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT,
  ADD COLUMN IF NOT EXISTS receipt_issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sub_total DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_due DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_payment_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.order_channel IS 'Channel/source of the order (online, walk-in, dine-in, takeaway)';
COMMENT ON COLUMN orders.service_mode IS 'How the order will be fulfilled (delivery/pickup/dine-in)';
COMMENT ON COLUMN orders.table_number IS 'Optional table number for dine-in orders';
COMMENT ON COLUMN orders.token_number IS 'Optional token number for counter pickup';
COMMENT ON COLUMN orders.receipt_number IS 'Human-readable receipt number for invoices';
COMMENT ON COLUMN orders.receipt_issued_at IS 'When the official receipt/invoice was generated';
COMMENT ON COLUMN orders.sub_total IS 'Subtotal before taxes/fees/discounts';
COMMENT ON COLUMN orders.tax_amount IS 'Total tax charged on the order';
COMMENT ON COLUMN orders.delivery_fee IS 'Delivery / service fee applied to the order';
COMMENT ON COLUMN orders.amount_paid IS 'How much money has been received for this order (sum of ledger entries)';
COMMENT ON COLUMN orders.amount_due IS 'Outstanding amount after payments';
COMMENT ON COLUMN orders.due_at IS 'When payment is/was due for this order';
COMMENT ON COLUMN orders.last_payment_at IS 'Timestamp of the most recent payment entry';

-- Seed baseline financial fields for existing orders
UPDATE orders
SET sub_total = CASE WHEN sub_total IS NULL OR sub_total = 0 THEN total_price ELSE sub_total END,
    amount_due = CASE WHEN amount_due IS NULL OR amount_due = 0 THEN GREATEST(total_price - COALESCE(amount_paid, 0), 0) ELSE amount_due END,
    delivery_fee = COALESCE(delivery_fee, 0),
    tax_amount = COALESCE(tax_amount, 0),
    amount_paid = COALESCE(amount_paid, 0);

CREATE INDEX IF NOT EXISTS idx_orders_channel ON orders(order_channel);
CREATE INDEX IF NOT EXISTS idx_orders_due_at ON orders(due_at) WHERE due_at IS NOT NULL;

-- Payment ledger --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  method TEXT NOT NULL DEFAULT 'cash',
  reference TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel TEXT NOT NULL DEFAULT 'pos',
  notes TEXT,
  received_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_payments IS 'Ledger of payments collected against each order (supports partial payments).';
COMMENT ON COLUMN order_payments.method IS 'Payment method label (cash/card/bank/etc).';

CREATE INDEX IF NOT EXISTS idx_order_payments_order ON order_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_paid_at ON order_payments(paid_at DESC);

-- Helper function + triggers to keep amount_paid/amount_due in sync ----------
CREATE OR REPLACE FUNCTION refresh_order_payment_totals(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE orders
  SET amount_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM order_payments
        WHERE order_id = p_order_id
      ),
      amount_due = GREATEST(
        total_price - (
          SELECT COALESCE(SUM(amount), 0)
          FROM order_payments
          WHERE order_id = p_order_id
        ),
        0
      ),
      last_payment_at = (
        SELECT MAX(paid_at)
        FROM order_payments
        WHERE order_id = p_order_id
      )
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION trg_order_payments_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM refresh_order_payment_totals(COALESCE(NEW.order_id, OLD.order_id));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS order_payments_after_change ON order_payments;
CREATE TRIGGER order_payments_after_change
AFTER INSERT OR UPDATE OR DELETE ON order_payments
FOR EACH ROW EXECUTE FUNCTION trg_order_payments_refresh();

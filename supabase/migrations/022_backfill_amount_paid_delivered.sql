-- Backfill amount_paid for orders where rider marked payment received but amount_paid was never updated
-- (fixes orders delivered before the rider deliver API was updated)

INSERT INTO order_payments (order_id, amount, method, channel, notes, paid_at)
SELECT
  o.id,
  GREATEST(0, (o.total_price::numeric - COALESCE(o.amount_paid, 0))),
  'cash',
  'pos',
  'COD collected by rider (backfill)',
  COALESCE(o.payment_received_at, o.delivered_at, NOW())
FROM orders o
WHERE o.status = 'delivered'
  AND o.payment_received_at IS NOT NULL
  AND (o.amount_paid IS NULL OR o.amount_paid < o.total_price)
  AND o.total_price > 0;

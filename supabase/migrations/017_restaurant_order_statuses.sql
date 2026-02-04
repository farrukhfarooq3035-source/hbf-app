-- Add statuses for dine-in and takeaway flows
-- order_on_table: dine-in food served at table
-- closed: payment done, order complete (dine-in/takeaway)

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (
  status IN (
    'new',
    'preparing',
    'ready',
    'on_the_way',
    'delivered',
    'order_on_table',
    'closed'
  )
);

COMMENT ON COLUMN orders.status IS 'new/preparing/ready/on_the_way/delivered (online) | order_on_table/closed (dine-in/takeaway)';

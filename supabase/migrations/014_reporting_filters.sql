-- Reporting helpers: top selling products filtered by order channel
CREATE OR REPLACE FUNCTION get_top_selling_products(
  lim int DEFAULT 5,
  channel_filter text DEFAULT NULL
)
RETURNS SETOF products
LANGUAGE sql
STABLE
AS $$
  WITH totals AS (
    SELECT oi.product_id, SUM(oi.qty) AS total
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.product_id IS NOT NULL
      AND (channel_filter IS NULL OR o.order_channel = channel_filter)
    GROUP BY oi.product_id
    ORDER BY total DESC
    LIMIT lim
  )
  SELECT p.*
  FROM products p
  JOIN totals t ON p.id = t.product_id
  WHERE p.is_active = true
  ORDER BY t.total DESC;
$$;

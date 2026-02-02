-- Top selling products: returns products ordered by total quantity sold (from order_items)
CREATE OR REPLACE FUNCTION get_top_selling_products(lim int DEFAULT 5)
RETURNS SETOF products
LANGUAGE sql
STABLE
AS $$
  WITH totals AS (
    SELECT product_id, sum(qty) AS total
    FROM order_items
    WHERE product_id IS NOT NULL
    GROUP BY product_id
    ORDER BY total DESC
    LIMIT lim
  )
  SELECT p.*
  FROM products p
  JOIN totals t ON p.id = t.product_id
  WHERE p.is_active = true
  ORDER BY t.total DESC;
$$;

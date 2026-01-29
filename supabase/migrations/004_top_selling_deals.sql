-- Top selling deals: returns deals ordered by total quantity sold (from order_items)
CREATE OR REPLACE FUNCTION get_top_selling_deals(lim int DEFAULT 12)
RETURNS SETOF deals
LANGUAGE sql
STABLE
AS $$
  WITH totals AS (
    SELECT deal_id, sum(qty) AS total
    FROM order_items
    WHERE deal_id IS NOT NULL
    GROUP BY deal_id
    ORDER BY total DESC
    LIMIT lim
  )
  SELECT d.*
  FROM deals d
  JOIN totals t ON d.id = t.deal_id
  ORDER BY t.total DESC;
$$;

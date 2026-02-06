-- Payment method (COD vs Jazz Cash) and Jazz Cash proof for online orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod' CHECK (payment_method IN ('cod', 'jazzcash')),
  ADD COLUMN IF NOT EXISTS jazzcash_proof_url TEXT;

COMMENT ON COLUMN orders.payment_method IS 'User-selected: cod (Cash on Delivery) or jazzcash';
COMMENT ON COLUMN orders.jazzcash_proof_url IS 'URL of payment proof screenshot uploaded by customer after Jazz Cash payment';

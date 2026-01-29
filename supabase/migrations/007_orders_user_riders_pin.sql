-- Link orders to authenticated user; add rider PIN for login
-- Run after 001–006

-- Orders: who placed the order (Supabase Auth user)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Riders: PIN for rider app login (4–6 digits, stored as plain text for simplicity; admin sets it)
ALTER TABLE riders ADD COLUMN IF NOT EXISTS pin TEXT;

COMMENT ON COLUMN orders.user_id IS 'Supabase Auth user who placed the order; required for new orders';
COMMENT ON COLUMN riders.pin IS 'PIN for rider app login; set by admin';

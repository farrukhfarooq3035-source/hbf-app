-- Add ready_at, delivered_at, distance_km to orders (run after 002)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS distance_km DECIMAL(6,2);

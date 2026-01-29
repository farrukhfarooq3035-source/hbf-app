-- Add rating columns to orders (run after 001_initial_schema.sql)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS rating_stars INT CHECK (rating_stars >= 1 AND rating_stars <= 5),
  ADD COLUMN IF NOT EXISTS rating_delivery INT CHECK (rating_delivery >= 1 AND rating_delivery <= 5),
  ADD COLUMN IF NOT EXISTS rating_quality INT CHECK (rating_quality >= 1 AND rating_quality <= 5),
  ADD COLUMN IF NOT EXISTS rating_comment TEXT,
  ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

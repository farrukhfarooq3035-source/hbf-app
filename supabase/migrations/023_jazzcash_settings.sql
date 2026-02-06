-- JazzCash payment settings (TILL ID from merchant)
INSERT INTO business_settings (key, value, updated_at) VALUES
  ('jazzcash_till_id', '"982260759"', NOW()),
  ('jazzcash_qr_url', '""', NOW())
ON CONFLICT (key) DO NOTHING;

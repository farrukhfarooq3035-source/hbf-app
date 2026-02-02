-- Default Happy Hour: 3-5pm, 20% off
INSERT INTO business_settings (key, value, updated_at) VALUES
  ('happy_hour_start', '"15:00"', NOW()),
  ('happy_hour_end', '"17:00"', NOW()),
  ('happy_hour_discount', '20', NOW())
ON CONFLICT (key) DO NOTHING;

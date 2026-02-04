-- Admin users: emails allowed to access admin panel (simpler than app_metadata)
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read (anon) - we only check if email exists
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert first admin (run this, then add more via SQL or Admin UI later)
INSERT INTO admin_users (email) VALUES ('Admin@gmail.com')
ON CONFLICT (email) DO NOTHING;

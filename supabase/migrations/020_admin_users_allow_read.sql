-- Fix: Allow anon read on admin_users to avoid RLS/auth timing issues after login
-- Table only has emails, no sensitive data
DROP POLICY IF EXISTS "Allow read for authenticated" ON admin_users;
CREATE POLICY "Allow read for all" ON admin_users
  FOR SELECT USING (true);

-- Invoice: sequential number format + admin who generated
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS invoice_generated_by TEXT;

COMMENT ON COLUMN orders.invoice_generated_by IS 'Admin display name who generated the invoice';

-- Admin profile: display name for bills
ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN admin_users.display_name IS 'Display name shown on invoices (e.g. Admin 1, Farrukh)';

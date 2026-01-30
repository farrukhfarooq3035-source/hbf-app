-- Reservation tables: 6 tables for 6 persons, 5 tables for 4 persons
CREATE TABLE IF NOT EXISTS reservation_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INT NOT NULL CHECK (capacity IN (4, 6)),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES reservation_tables(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  reservation_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  guest_count INT NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- RLS: reservation_tables readable by all; reservations readable by all, insert by all
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reservation tables are readable by all"
  ON reservation_tables FOR SELECT USING (true);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reservations are readable by all"
  ON reservations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert a reservation"
  ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for status (admin can do via service role)"
  ON reservations FOR UPDATE USING (true);

-- Seed 6 tables for 6 persons, 5 tables for 4 persons (only if empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM reservation_tables LIMIT 1) THEN
    INSERT INTO reservation_tables (name, capacity, sort_order) VALUES
      ('Table 1 (6)', 6, 1),
      ('Table 2 (6)', 6, 2),
      ('Table 3 (6)', 6, 3),
      ('Table 4 (6)', 6, 4),
      ('Table 5 (6)', 6, 5),
      ('Table 6 (6)', 6, 6),
      ('Table 7 (4)', 4, 7),
      ('Table 8 (4)', 4, 8),
      ('Table 9 (4)', 4, 9),
      ('Table 10 (4)', 4, 10),
      ('Table 11 (4)', 4, 11);
  END IF;
END $$;

-- Favorite orders: user saves orders to reorder quickly
CREATE TABLE IF NOT EXISTS favorite_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_favorite_orders_user ON favorite_orders(user_id);

-- RLS for favorite_orders: user can only see/add/remove their own favorites
ALTER TABLE favorite_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites"
  ON favorite_orders FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

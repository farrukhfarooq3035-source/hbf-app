-- Rider locations: latest lat/lng per rider (updated by rider app)
CREATE TABLE IF NOT EXISTS rider_locations (
  rider_id UUID PRIMARY KEY REFERENCES riders(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_rider_locations_updated ON rider_locations(updated_at);

-- RLS: allow read for anon (customer will fetch their order's rider location via API that checks order ownership)
-- Service role will be used in API for write and for read (API validates context)
ALTER TABLE rider_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read rider_locations" ON rider_locations FOR SELECT USING (true);
CREATE POLICY "Allow service write rider_locations" ON rider_locations FOR ALL USING (true);

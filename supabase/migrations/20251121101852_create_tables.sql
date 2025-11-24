-- ============================================
-- Sit or Live - Database Schema
-- Created: 2025-11-21
-- ============================================

-- 1. theme_usage table
CREATE TABLE IF NOT EXISTS theme_usage (
  id BIGSERIAL PRIMARY KEY,
  theme_name VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  weather_code INT,
  count INT DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_theme_city UNIQUE(theme_name, city)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_theme_name ON theme_usage(theme_name);
CREATE INDEX IF NOT EXISTS idx_city ON theme_usage(city);
CREATE INDEX IF NOT EXISTS idx_last_updated ON theme_usage(last_updated);
CREATE INDEX IF NOT EXISTS idx_count ON theme_usage(count DESC);

-- Comments
COMMENT ON TABLE theme_usage IS 'Global theme usage statistics (anonymous, city-level aggregation)';
COMMENT ON COLUMN theme_usage.theme_name IS 'Theme name: Daylight Survivor, Vampire Night, Silent Hill, Rainy Cemetery, Frozen Dead, Frankenstein Lab';
COMMENT ON COLUMN theme_usage.city IS 'City name (not exact location)';
COMMENT ON COLUMN theme_usage.count IS 'Number of active users';

-- ============================================

-- 2. activity_heatmap table
CREATE TABLE IF NOT EXISTS activity_heatmap (
  id BIGSERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  hour INT CHECK (hour >= 0 AND hour < 24),
  active_users INT DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_city_hour UNIQUE(city, hour)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_city ON activity_heatmap(city);
CREATE INDEX IF NOT EXISTS idx_activity_hour ON activity_heatmap(hour);
CREATE INDEX IF NOT EXISTS idx_activity_updated ON activity_heatmap(last_updated);
CREATE INDEX IF NOT EXISTS idx_activity_users ON activity_heatmap(active_users DESC);

-- Comments
COMMENT ON TABLE activity_heatmap IS 'Global activity heatmap (anonymous, city-level, hourly aggregation)';
COMMENT ON COLUMN activity_heatmap.hour IS 'Hour in UTC (0-23)';
COMMENT ON COLUMN activity_heatmap.active_users IS 'Number of active users in this hour';

-- ============================================

-- 3. Row Level Security (RLS)

-- theme_usage RLS
ALTER TABLE theme_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read theme usage"
  ON theme_usage
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert theme usage"
  ON theme_usage
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update theme usage"
  ON theme_usage
  FOR UPDATE
  USING (true);

-- activity_heatmap RLS
ALTER TABLE activity_heatmap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read activity heatmap"
  ON activity_heatmap
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert activity heatmap"
  ON activity_heatmap
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update activity heatmap"
  ON activity_heatmap
  FOR UPDATE
  USING (true);

-- ============================================

-- 4. Sample Data (for testing)
INSERT INTO theme_usage (theme_name, city, country, weather_code, count) VALUES
  ('Rainy Cemetery', 'Seoul', 'South Korea', 61, 1234),
  ('Rainy Cemetery', 'Tokyo', 'Japan', 61, 987),
  ('Rainy Cemetery', 'London', 'United Kingdom', 61, 456),
  ('Daylight Survivor', 'Los Angeles', 'United States', 0, 5678),
  ('Daylight Survivor', 'Sydney', 'Australia', 0, 3456),
  ('Daylight Survivor', 'Dubai', 'United Arab Emirates', 0, 2345),
  ('Frozen Dead', 'Moscow', 'Russia', 71, 789),
  ('Frozen Dead', 'Oslo', 'Norway', 71, 456),
  ('Frankenstein Lab', 'Seattle', 'United States', 95, 234),
  ('Vampire Night', 'Paris', 'France', 2, 1567),
  ('Silent Hill', 'Beijing', 'China', 45, 890),
  ('Silent Hill', 'Berlin', 'Germany', 45, 567)
ON CONFLICT (theme_name, city) DO NOTHING;

INSERT INTO activity_heatmap (city, country, latitude, longitude, hour, active_users) VALUES
  ('Seoul', 'South Korea', 37.5665, 126.9780, 6, 1234),
  ('Tokyo', 'Japan', 35.6762, 139.6503, 6, 987),
  ('London', 'United Kingdom', 51.5074, -0.1278, 22, 234),
  ('New York', 'United States', 40.7128, -74.0060, 17, 89),
  ('Los Angeles', 'United States', 34.0522, -118.2437, 14, 45),
  ('Sydney', 'Australia', -33.8688, 151.2093, 9, 567),
  ('Moscow', 'Russia', 55.7558, 37.6173, 0, 123),
  ('Paris', 'France', 48.8566, 2.3522, 22, 345),
  ('Berlin', 'Germany', 52.5200, 13.4050, 21, 278),
  ('Beijing', 'China', 39.9042, 116.4074, 7, 1456)
ON CONFLICT (city, hour) DO NOTHING;

# 07_DATABASE_SCHEMA

## Purpose

Complete PostgreSQL database schema for Supabase, including tables, indexes, RLS policies, and RPC functions. Everything needed to recreate the database from scratch.

## Prerequisites

- Supabase CLI installed (see `04_ENVIRONMENT_SETUP.md`)
- PostgreSQL knowledge (basic)
- Supabase project created (local or cloud)

## Database Overview

**Database**: PostgreSQL 15.x (Supabase)  
**Tables**: 2 (theme_usage, activity_heatmap)  
**RPC Functions**: 2 (upsert functions)  
**RLS Policies**: 6 (3 per table)  
**Purpose**: Anonymous, aggregated global statistics

## Schema Design Principles

1. **Privacy First**: No personal data, only city-level aggregation
2. **Anonymous**: No user IDs, no tracking
3. **Aggregated**: Count-based statistics only
4. **Real-time**: Optimized for WebSocket subscriptions
5. **Conflict Resolution**: Upsert patterns for concurrent updates

## Complete Schema

### Migration 1: Create Tables

**File**: `supabase/migrations/20251121101852_create_tables.sql`

```sql
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
```

### Migration 2: Create RPC Functions

**File**: `supabase/migrations/20251121105100_create_upsert_functions.sql`

```sql
-- RPC function: theme_usage upsert (increment count)
CREATE OR REPLACE FUNCTION upsert_theme_usage(
  p_theme_name TEXT,
  p_city TEXT,
  p_country TEXT,
  p_weather_code INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO theme_usage (theme_name, city, country, weather_code, count, last_updated)
  VALUES (p_theme_name, p_city, p_country, p_weather_code, 1, NOW())
  ON CONFLICT (theme_name, city)
  DO UPDATE SET
    count = theme_usage.count + 1,
    weather_code = EXCLUDED.weather_code,
    last_updated = NOW();
END;
$$;

-- RPC function: activity_heatmap upsert (increment active_users)
CREATE OR REPLACE FUNCTION upsert_activity_heatmap(
  p_city TEXT,
  p_country TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_hour INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO activity_heatmap (city, country, latitude, longitude, hour, active_users, last_updated)
  VALUES (p_city, p_country, p_latitude, p_longitude, p_hour, 1, NOW())
  ON CONFLICT (city, hour)
  DO UPDATE SET
    active_users = activity_heatmap.active_users + 1,
    last_updated = NOW();
END;
$$;
```

## Implementation Steps

### Local Development

```bash
# 1. Start Supabase locally
supabase start

# Expected output:
# Started supabase local development setup.
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio URL: http://127.0.0.1:54323

# 2. Create migrations directory
mkdir -p supabase/migrations

# 3. Create migration files
cat > supabase/migrations/20251121101852_create_tables.sql << 'EOF'
[paste complete SQL from above]
EOF

cat > supabase/migrations/20251121105100_create_upsert_functions.sql << 'EOF'
[paste complete SQL from above]
EOF

# 4. Apply migrations
supabase db reset

# Expected output:
# Applying migration 20251121101852_create_tables.sql...
# Applying migration 20251121105100_create_upsert_functions.sql...
# Finished supabase db reset on branch main.

# 5. Verify tables
supabase db diff

# Expected: No differences (migrations applied)
```

### Production (Supabase Cloud)

```bash
# 1. Link to cloud project
supabase link --project-ref your-project-ref

# 2. Push migrations
supabase db push

# Expected output:
# Applying migration 20251121101852_create_tables.sql...
# Applying migration 20251121105100_create_upsert_functions.sql...
# Finished supabase db push.

# 3. Enable Realtime
# Go to Supabase Dashboard > Database > Replication
# Enable replication for:
# - theme_usage
# - activity_heatmap
```

## Verification

### Check Tables

```sql
-- Connect to database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

-- List tables
\dt

-- Expected output:
--  Schema |       Name        | Type  |  Owner
-- --------+-------------------+-------+----------
--  public | theme_usage       | table | postgres
--  public | activity_heatmap  | table | postgres

-- Check theme_usage structure
\d theme_usage

-- Expected columns:
-- id, theme_name, city, country, weather_code, count, last_updated

-- Check activity_heatmap structure
\d activity_heatmap

-- Expected columns:
-- id, city, country, latitude, longitude, hour, active_users, last_updated
```

### Check RPC Functions

```sql
-- List functions
\df upsert*

-- Expected output:
-- upsert_theme_usage(text, text, text, integer)
-- upsert_activity_heatmap(text, text, double precision, double precision, integer)

-- Test upsert_theme_usage
SELECT upsert_theme_usage('Daylight Survivor', 'Test City', 'Test Country', 0);

-- Verify
SELECT * FROM theme_usage WHERE city = 'Test City';

-- Expected: 1 row with count = 1

-- Test again (should increment)
SELECT upsert_theme_usage('Daylight Survivor', 'Test City', 'Test Country', 0);

-- Verify
SELECT * FROM theme_usage WHERE city = 'Test City';

-- Expected: 1 row with count = 2
```

### Check RLS Policies

```sql
-- List policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('theme_usage', 'activity_heatmap');

-- Expected: 6 policies (3 per table)
```

### Check Indexes

```sql
-- List indexes
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('theme_usage', 'activity_heatmap');

-- Expected: 8 indexes (4 per table)
```

## Data Model

### theme_usage

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| theme_name | VARCHAR(50) | NOT NULL | Theme name (6 options) |
| city | VARCHAR(100) | NOT NULL | City name |
| country | VARCHAR(100) | | Country name |
| weather_code | INT | | Open-Meteo weather code |
| count | INT | DEFAULT 1 | Number of users |
| last_updated | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Unique Constraint**: (theme_name, city)

### activity_heatmap

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | BIGSERIAL | PRIMARY KEY | Unique identifier |
| city | VARCHAR(100) | NOT NULL | City name |
| country | VARCHAR(100) | | Country name |
| latitude | FLOAT | NOT NULL | Latitude |
| longitude | FLOAT | NOT NULL | Longitude |
| hour | INT | CHECK (0-23) | Hour in UTC |
| active_users | INT | DEFAULT 1 | Number of active users |
| last_updated | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

**Unique Constraint**: (city, hour)

## Performance Optimization

### Indexes Explained

1. **idx_theme_name**: Fast theme filtering
2. **idx_city**: Fast city lookup
3. **idx_last_updated**: Efficient time-based queries
4. **idx_count**: Sorted by popularity
5. **idx_activity_city**: Fast city lookup in heatmap
6. **idx_activity_hour**: Hour-based filtering
7. **idx_activity_updated**: Time-based queries
8. **idx_activity_users**: Sorted by activity level

### Query Performance

```sql
-- Fast query (uses index)
EXPLAIN ANALYZE 
SELECT * FROM theme_usage WHERE theme_name = 'Daylight Survivor';

-- Expected: Index Scan using idx_theme_name

-- Fast aggregation
EXPLAIN ANALYZE
SELECT theme_name, SUM(count) as total
FROM theme_usage
GROUP BY theme_name
ORDER BY total DESC;

-- Expected: < 10ms for 1000 rows
```

## Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution**:
```bash
# Reset database
supabase db reset

# Or drop tables manually
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
DROP TABLE IF EXISTS theme_usage CASCADE;
DROP TABLE IF EXISTS activity_heatmap CASCADE;
\q

# Reapply migrations
supabase db reset
```

### Issue: RLS blocks all queries

**Solution**:
```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('theme_usage', 'activity_heatmap');

-- Disable RLS temporarily (testing only)
ALTER TABLE theme_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_heatmap DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE theme_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_heatmap ENABLE ROW LEVEL SECURITY;
```

### Issue: Realtime not working

**Solution**:
1. Check Supabase Dashboard > Database > Replication
2. Enable replication for both tables
3. Restart Supabase: `supabase stop && supabase start`

## Next Steps

Proceed to `08_API_SPECIFICATIONS.md` for external API integration details.

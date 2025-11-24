-- RPC function: theme_usage upsert (increment count)
CREATE OR REPLACE FUNCTION upsert_theme_usage(
  p_theme_name TEXT,
  p_city TEXT,
  p_country TEXT,
  p_weather_code INTEGER
)
RETURNS void
LANGUAGE plpgsql
AS $
BEGIN
  INSERT INTO theme_usage (theme_name, city, country, weather_code, count, last_updated)
  VALUES (p_theme_name, p_city, p_country, p_weather_code, 1, NOW())
  ON CONFLICT (theme_name, city)
  DO UPDATE SET
    count = theme_usage.count + 1,
    weather_code = EXCLUDED.weather_code,
    last_updated = NOW();
END;
$;

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
AS $
BEGIN
  INSERT INTO activity_heatmap (city, country, latitude, longitude, hour, active_users, last_updated)
  VALUES (p_city, p_country, p_latitude, p_longitude, p_hour, 1, NOW())
  ON CONFLICT (city, hour)
  DO UPDATE SET
    active_users = activity_heatmap.active_users + 1,
    last_updated = NOW();
END;
$;

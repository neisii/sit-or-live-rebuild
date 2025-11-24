# 08_API_SPECIFICATIONS

## Purpose

Complete specifications for all external APIs used in the project, including request/response formats, authentication, rate limits, and error handling. Everything needed to integrate with external services.

## Prerequisites

- Internet connection
- Understanding of REST APIs
- Basic HTTP knowledge

## APIs Overview

| API | Purpose | Authentication | Rate Limit | Cost |
|-----|---------|----------------|------------|------|
| Open-Meteo Weather | Current weather data | None | Unlimited | Free |
| Open-Meteo Geocoding | City search | None | Unlimited | Free |
| Supabase REST | Database operations | API Key | 500 req/s | Free tier |
| Supabase Realtime | WebSocket updates | API Key | 200 concurrent | Free tier |
| Discord Webhooks | Notifications | Webhook URL | 30 req/min | Free |

## 1. Open-Meteo Weather API

### Base URL
```
https://api.open-meteo.com/v1/forecast
```

### Authentication
None required

### Get Current Weather

**Endpoint**: `GET /v1/forecast`

**Parameters**:
```typescript
{
  latitude: number;      // Required: -90 to 90
  longitude: number;     // Required: -180 to 180
  current: string;       // Required: "temperature_2m,weathercode"
  timezone: string;      // Optional: "auto" (recommended)
}
```

**Example Request**:
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=auto"
```

**Example Response**:
```json
{
  "latitude": 37.5665,
  "longitude": 126.978,
  "generationtime_ms": 0.123,
  "utc_offset_seconds": 32400,
  "timezone": "Asia/Seoul",
  "timezone_abbreviation": "KST",
  "elevation": 38.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "weathercode": "wmo code"
  },
  "current": {
    "time": "2025-11-23T14:30",
    "interval": 900,
    "temperature_2m": 15.2,
    "weathercode": 61
  }
}
```

**Weather Codes** (WMO):
```typescript
const WEATHER_CODE_MAP = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};
```

**Theme Mapping**:
```typescript
function mapWeatherToTheme(weatherCode: number): string {
  if (weatherCode === 0) return 'Daylight Survivor';
  if (weatherCode >= 1 && weatherCode <= 3) return 'Vampire Night';
  if (weatherCode >= 45 && weatherCode <= 48) return 'Silent Hill';
  if (weatherCode >= 51 && weatherCode <= 67) return 'Rainy Cemetery';
  if (weatherCode >= 71 && weatherCode <= 77) return 'Frozen Dead';
  if (weatherCode >= 80 && weatherCode <= 99) return 'Frankenstein Lab';
  return 'Daylight Survivor';
}
```

**Error Handling**:
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Failed to fetch weather:', error);
  // Use cached data or show error
}
```

## 2. Open-Meteo Geocoding API

### Base URL
```
https://geocoding-api.open-meteo.com/v1/search
```

### Authentication
None required

### Search Cities

**Endpoint**: `GET /v1/search`

**Parameters**:
```typescript
{
  name: string;          // Required: City name
  count: number;         // Optional: Max results (default: 10)
  language: string;      // Optional: "en", "ko", "ja", etc.
  format: string;        // Optional: "json" (default)
}
```

**Example Request**:
```bash
curl "https://geocoding-api.open-meteo.com/v1/search?name=Seoul&count=10&language=en&format=json"
```

**Example Response**:
```json
{
  "results": [
    {
      "id": 1835848,
      "name": "Seoul",
      "latitude": 37.566,
      "longitude": 126.9784,
      "elevation": 38.0,
      "feature_code": "PPLC",
      "country_code": "KR",
      "admin1_id": 1835847,
      "admin2_id": 1835847,
      "admin3_id": 11283788,
      "admin4_id": 11283788,
      "timezone": "Asia/Seoul",
      "population": 10349312,
      "postcodes": ["100-011"],
      "country_id": 1835841,
      "country": "South Korea",
      "admin1": "Seoul",
      "admin2": "Seoul",
      "admin3": "Seoul",
      "admin4": "Seoul"
    }
  ],
  "generationtime_ms": 1.234
}
```

**Feature Codes** (GeoNames):
```typescript
const CITY_FEATURE_CODES = [
  'PPLC',   // Capital of a political entity
  'PPLA',   // Seat of a first-order administrative division
  'PPLA2',  // Seat of a second-order administrative division
  'PPLA3',  // Seat of a third-order administrative division
  'PPLA4',  // Seat of a fourth-order administrative division
  'PPL'     // Populated place
];

// Filter non-cities
function filterCities(results: any[]): any[] {
  return results.filter(r => CITY_FEATURE_CODES.includes(r.feature_code));
}
```

**Smart Filtering** (remove duplicates):
```typescript
function smartFilter(cities: any[]): any[] {
  const filtered = cities.reduce((acc, city) => {
    const key = `${city.name.toLowerCase()}_${city.country_code}`;
    const existing = acc.get(key);
    
    const priority: Record<string, number> = { 
      PPLC: 5, PPLA: 4, PPLA2: 3, PPLA3: 2, PPLA4: 1, PPL: 0 
    };
    
    const cityPriority = priority[city.feature_code] || 0;
    const existingPriority = existing ? (priority[existing.feature_code] || 0) : -1;
    
    if (!existing || cityPriority > existingPriority || 
        (cityPriority === existingPriority && (city.population || 0) > (existing.population || 0))) {
      acc.set(key, city);
    }
    
    return acc;
  }, new Map<string, any>());
  
  return Array.from(filtered.values());
}
```

## 3. Supabase REST API

### Base URL
```
https://your-project.supabase.co/rest/v1
```

### Authentication
```typescript
const headers = {
  'apikey': 'your-anon-key',
  'Authorization': 'Bearer your-anon-key',
  'Content-Type': 'application/json'
};
```

### Get Theme Statistics

**Endpoint**: `GET /theme_usage`

**Example Request**:
```bash
curl "https://your-project.supabase.co/rest/v1/theme_usage?select=*&order=count.desc" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

**Example Response**:
```json
[
  {
    "id": 1,
    "theme_name": "Daylight Survivor",
    "city": "Los Angeles",
    "country": "United States",
    "weather_code": 0,
    "count": 5678,
    "last_updated": "2025-11-23T14:30:00Z"
  }
]
```

### Call RPC Function

**Endpoint**: `POST /rpc/upsert_theme_usage`

**Request Body**:
```json
{
  "p_theme_name": "Daylight Survivor",
  "p_city": "Seoul",
  "p_country": "South Korea",
  "p_weather_code": 0
}
```

**Example Request**:
```bash
curl -X POST "https://your-project.supabase.co/rest/v1/rpc/upsert_theme_usage" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"p_theme_name":"Daylight Survivor","p_city":"Seoul","p_country":"South Korea","p_weather_code":0}'
```

**Example Response**:
```
204 No Content
```

## 4. Supabase Realtime (WebSocket)

### Connection

**JavaScript Client**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Subscribe to changes
const channel = supabase
  .channel('theme_usage_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'theme_usage'
  }, (payload) => {
    console.log('Change received:', payload);
    // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    // payload.new: new row data
    // payload.old: old row data (for UPDATE/DELETE)
  })
  .subscribe();

// Unsubscribe
supabase.removeChannel(channel);
```

**Rust Client** (via reqwest):
```rust
// Supabase Realtime uses WebSocket protocol
// For Rust, use REST API polling or implement WebSocket client
// This project uses REST API from Rust backend
```

## 5. Discord Webhooks

### Base URL
```
https://discord.com/api/webhooks/{webhook_id}/{webhook_token}
```

### Authentication
Webhook URL contains authentication token

### Send Notification

**Endpoint**: `POST /webhooks/{webhook_id}/{webhook_token}`

**Request Body**:
```json
{
  "content": "🎨 Theme changed: Daylight Survivor",
  "embeds": [
    {
      "title": "Weather-based Theme",
      "description": "Location: Seoul, South Korea",
      "color": 5865242
    }
  ]
}
```

**Example Request**:
```bash
curl -X POST "https://discord.com/api/webhooks/123/abc" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "🎨 Theme changed",
    "embeds": [{
      "title": "Weather-based Theme",
      "description": "Location: Seoul",
      "color": 5865242
    }]
  }'
```

**Rate Limits**:
- 30 requests per minute per webhook
- 5 requests per second burst

**Error Handling**:
```typescript
async function sendDiscordNotification(webhookUrl: string, message: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        embeds: [{ color: 0x5865F2 }]
      })
    });
    
    if (response.status === 429) {
      // Rate limited
      const retryAfter = response.headers.get('Retry-After');
      console.warn(`Rate limited, retry after ${retryAfter}s`);
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
}
```

## Complete Integration Example

### Weather Service (TypeScript)

```typescript
import { Location } from './locationService';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  theme: string;
  timestamp: string;
}

export async function fetchWeather(location: Location): Promise<WeatherData> {
  const { latitude, longitude } = location;
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }
  
  const data = await response.json();
  const theme = mapWeatherToTheme(data.current.weathercode);
  
  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weathercode,
    weatherDescription: getWeatherDescription(data.current.weathercode),
    theme,
    timestamp: data.current.time,
  };
}
```

### Analytics Service (Rust)

```rust
use reqwest;
use serde_json::json;

pub async fn report_theme_change(
    theme_name: String,
    city: String,
    country: String,
    weather_code: i32,
) -> Result<(), String> {
    let supabase_url = std::env::var("SUPABASE_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:54321".to_string());
    let supabase_key = std::env::var("SUPABASE_ANON_KEY")
        .unwrap_or_else(|_| "default-key".to_string());

    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/rest/v1/rpc/upsert_theme_usage", supabase_url))
        .header("apikey", supabase_key.clone())
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&json!({
            "p_theme_name": theme_name,
            "p_city": city,
            "p_country": country,
            "p_weather_code": weather_code
        }))
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if response.status().is_success() {
        Ok(())
    } else {
        Err(format!("API error: {}", response.status()))
    }
}
```

## Verification

### Test Weather API

```bash
# Test with Seoul coordinates
curl "https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=auto"

# Expected: JSON response with temperature and weather code
```

### Test Geocoding API

```bash
# Search for Seoul
curl "https://geocoding-api.open-meteo.com/v1/search?name=Seoul&count=5&language=en"

# Expected: Array of results with Seoul
```

### Test Supabase API

```bash
# Get theme statistics
curl "https://your-project.supabase.co/rest/v1/theme_usage?select=*" \
  -H "apikey: your-anon-key"

# Expected: Array of theme usage data
```

### Test Discord Webhook

```bash
# Send test message
curl -X POST "https://discord.com/api/webhooks/your-webhook-url" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message from sit-or-live"}'

# Expected: Message appears in Discord channel
```

## Troubleshooting

### Issue: Weather API returns 400

**Cause**: Invalid coordinates  
**Solution**: Verify latitude (-90 to 90) and longitude (-180 to 180)

### Issue: Geocoding returns no results

**Cause**: City name too short or misspelled  
**Solution**: Use at least 2 characters, try different spellings

### Issue: Supabase 401 Unauthorized

**Cause**: Invalid API key  
**Solution**: Check SUPABASE_ANON_KEY in .env file

### Issue: Discord 429 Rate Limited

**Cause**: Too many requests  
**Solution**: Implement rate limiting (max 30 req/min)

### Issue: CORS errors in browser

**Cause**: Browser security  
**Solution**: Use server-side API calls (Rust backend)

## Next Steps

Proceed to `09_COMPONENT_SPECIFICATIONS.md` for React component details.

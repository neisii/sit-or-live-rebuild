# 02_TECHNICAL_ARCHITECTURE

## Purpose
Understand the complete system architecture, component relationships, and data flow.

## Prerequisites
- Read `01_PROJECT_OVERVIEW.md`
- Understand the 8 core features
- Understand technology stack constraints

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DESKTOP APPLICATION                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Frontend (TypeScript)                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │   App    │  │ Health   │  │ Weather  │            │ │
│  │  │Component │  │ Monitor  │  │ Display  │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │              │                   │ │
│  │  ┌────┴─────────────┴──────────────┴─────┐            │ │
│  │  │         Service Layer                  │            │ │
│  │  │  - weatherService                      │            │ │
│  │  │  - healthService                       │            │ │
│  │  │  - themeService                        │            │ │
│  │  │  - timerService (JS/Rust dual)         │            │ │
│  │  └────────────────┬───────────────────────┘            │ │
│  └───────────────────┼────────────────────────────────────┘ │
│                      │ Tauri IPC                            │
│  ┌───────────────────┴────────────────────────────────────┐ │
│  │              Rust Backend (Tauri)                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │ Weather  │  │Analytics │  │  Theme   │            │ │
│  │  │   API    │  │ Reporter │  │ Manager  │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │              │                   │ │
│  │  ┌────┴─────────────┴──────────────┴─────┐            │ │
│  │  │         System Integration             │            │ │
│  │  │  - File system (theme files)           │            │ │
│  │  │  - HTTP client (APIs)                  │            │ │
│  │  │  - Window management                   │            │ │
│  │  └────────────────────────────────────────┘            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLOUD INFRASTRUCTURE                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Supabase (PostgreSQL)                      │ │
│  │  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │ theme_usage  │  │activity_     │                   │ │
│  │  │   table      │  │heatmap table │                   │ │
│  │  └──────┬───────┘  └──────┬───────┘                   │ │
│  │         │                  │                           │ │
│  │  ┌──────┴──────────────────┴───────┐                  │ │
│  │  │    Realtime (WebSocket)         │                  │ │
│  │  └──────────────┬──────────────────┘                  │ │
│  └─────────────────┼─────────────────────────────────────┘ │
└────────────────────┼───────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    WEB DASHBOARD                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 (App Router)                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Theme   │  │ Activity │  │Interactive│            │ │
│  │  │  Stats   │  │   Map    │  │   Demo   │            │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘            │ │
│  │       │             │              │                   │ │
│  │  ┌────┴─────────────┴──────────────┴─────┐            │ │
│  │  │         Supabase Client                │            │ │
│  │  │  - Real-time subscriptions             │            │ │
│  │  │  - SWR caching                         │            │ │
│  │  └────────────────────────────────────────┘            │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Desktop App (Tauri)

```
App.tsx (Root)
├── WelcomeTooltip.tsx (First-time user guide)
├── LocationSearch.tsx (City selection)
├── WeatherDisplay.tsx (Current weather)
├── HealthMonitor.tsx (Activity stats)
├── BreakReminder.tsx (Eye health notification)
├── ZombieWarning.tsx (Inactivity alert)
└── Settings (Hover popups)
    ├── AppSettings (Always on top, language)
    ├── HealthSettings (Work/break duration)
    └── HelpPopup (User guide)
```

### Web Dashboard (Next.js)

```
app/
├── layout.tsx (Root layout)
├── page.tsx (Home page)
└── components/
    ├── ThemeStats.tsx (Global theme statistics)
    ├── ActivityMap.tsx (Interactive heatmap)
    └── InteractiveDemo.tsx (Feature showcase)
```

## Data Flow

### 1. Weather → Theme Flow

```
User selects location
    ↓
weatherService.getWeather(location)
    ↓
Open-Meteo API call
    ↓
mapWeatherToTheme(weatherCode)
    ↓
themeService.applyTheme(themeName)
    ↓
Rust: apply_theme command
    ↓
Write theme files to:
- ~/.kiro/settings/settings.json
- ~/Library/Application Support/iTerm2/DynamicProfiles/
- ~/.config/Code/User/settings.json
- etc.
    ↓
analyticsService.reportThemeChange()
    ↓
Supabase: upsert_theme_usage RPC
    ↓
Web Dashboard: Real-time update via WebSocket
```

### 2. Health Monitoring Flow

```
App starts
    ↓
healthService.startHealthMonitoring()
    ↓
Every 1 second:
    ├── Get idle time from Tauri
    ├── Calculate activity intensity
    ├── Update timer (if active)
    └── Calculate eye strain
    ↓
Every 20 minutes (configurable):
    └── Show BreakReminder
    ↓
Every 30 minutes (configurable):
    └── Show ZombieWarning (if idle)
    ↓
Every 30 minutes:
    └── analyticsService.reportActivity()
        ↓
        Supabase: upsert_activity_heatmap RPC
        ↓
        Web Dashboard: Real-time update
```

### 3. Real-time Dashboard Flow

```
Web Dashboard loads
    ↓
Subscribe to Supabase Realtime
    ├── Channel: theme_usage_changes
    └── Channel: activity_heatmap_changes
    ↓
Desktop app reports data
    ↓
Supabase triggers WebSocket event
    ↓
Dashboard receives update (1-2s latency)
    ↓
SWR cache invalidated
    ↓
UI re-renders with new data
```

## Technology Decisions

### Why Tauri over Electron?

| Metric | Electron | Tauri | Winner |
|--------|----------|-------|--------|
| App Size | 100-150MB | 3-5MB | Tauri (20x smaller) |
| Memory | 100-200MB | 10-20MB | Tauri (10x less) |
| Startup | 2-5s | <1s | Tauri (5x faster) |
| Security | Node.js | Rust | Tauri (memory safe) |
| Bundle | Chromium | System WebView | Tauri (no bundling) |

**Decision**: Tauri for performance and size

### Why Dual Timer System?

**JavaScript Timer**:
- ✅ Simple, no dependencies
- ✅ Works immediately
- ❌ Less accurate (±100ms)
- ❌ Affected by tab switching

**Rust Timer**:
- ✅ Nanosecond precision (±0.001s)
- ✅ OS-level, always accurate
- ✅ Persistent (survives app restart)
- ❌ More complex setup

**Decision**: Support both, default to Rust

### Why WebSocket over Polling?

| Metric | Polling (30s) | WebSocket | Winner |
|--------|---------------|-----------|--------|
| Latency | 0-30s | 1-2s | WebSocket (15x faster) |
| Requests | 120/hour | 12/hour | WebSocket (90% less) |
| Server Load | High | Low | WebSocket |
| Complexity | Simple | Medium | Polling |

**Decision**: WebSocket for real-time UX

### Why Supabase over Custom Backend?

**Supabase**:
- ✅ PostgreSQL (proven, scalable)
- ✅ Real-time built-in (WebSocket)
- ✅ Free tier (25k rows, 500MB)
- ✅ RLS (Row Level Security)
- ✅ No server management

**Custom Backend**:
- ❌ Need to build everything
- ❌ Need to host/manage
- ❌ Need to implement real-time
- ❌ More time/cost

**Decision**: Supabase for speed and reliability

## State Management

### Desktop App State

**Local State (React useState)**:
- UI state (modals, popups, loading)
- Form inputs (location search)
- Temporary data (search results)

**localStorage**:
- User preferences (language, always on top)
- Current location
- Health settings
- Timer state (backup)

**Session State**:
- Current weather (30min cache)
- Health statistics (current session only)
- Activity history (last 5 seconds)

**Rust State (Arc<Mutex>)**:
- Timer state (work duration)
- Persistent data (survives restart)

### Web Dashboard State

**SWR Cache**:
- Theme statistics
- Activity heatmap data
- 30s stale time
- Real-time revalidation

**React State**:
- UI state (loading, errors)
- Selected filters
- Map interactions

## API Integration

### Open-Meteo Weather API

**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Request**:
```typescript
{
  latitude: 35.6762,
  longitude: 139.6503,
  current: "temperature_2m,weathercode",
  timezone: "auto"
}
```

**Response**:
```typescript
{
  current: {
    time: "2025-11-23T15:00",
    temperature_2m: 18.5,
    weathercode: 3  // Cloudy
  }
}
```

**Rate Limit**: 10,000 requests/day (free)  
**Caching**: 30 minutes client-side

### Open-Meteo Geocoding API

**Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`

**Request**:
```typescript
{
  name: "Tokyo",
  count: 10,
  language: "en",
  format: "json"
}
```

**Response**:
```typescript
{
  results: [
    {
      id: 1850144,
      name: "Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
      country: "Japan",
      admin1: "Tokyo",
      feature_code: "PPLC"
    }
  ]
}
```

### Supabase RPC Functions

**upsert_theme_usage**:
```sql
CREATE OR REPLACE FUNCTION upsert_theme_usage(
  p_theme_name VARCHAR,
  p_city VARCHAR,
  p_country VARCHAR,
  p_weather_code INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO theme_usage (theme_name, city, country, weather_code, count)
  VALUES (p_theme_name, p_city, p_country, p_weather_code, 1)
  ON CONFLICT (theme_name, city)
  DO UPDATE SET
    count = theme_usage.count + 1,
    weather_code = p_weather_code,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
```

**upsert_activity_heatmap**:
```sql
CREATE OR REPLACE FUNCTION upsert_activity_heatmap(
  p_city VARCHAR,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_hour INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_heatmap (city, latitude, longitude, hour, active_users)
  VALUES (p_city, p_latitude, p_longitude, p_hour, 1)
  ON CONFLICT (city, hour)
  DO UPDATE SET
    active_users = activity_heatmap.active_users + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
```

## Security Model

### Desktop App
- **No authentication**: Local app, no user accounts
- **API keys**: None required (Open-Meteo is free)
- **Local data**: Encrypted by OS (macOS Keychain, Windows Credential Manager)
- **Network**: HTTPS only

### Web Dashboard
- **No authentication**: Public read-only dashboard
- **RLS policies**: Allow all reads, allow anonymous inserts
- **Rate limiting**: Supabase built-in (100 req/s)
- **CORS**: Configured for Vercel domain

### Privacy
- **Personal data**: Never leaves device
- **Server data**: Anonymous aggregates only (city-level)
- **No tracking**: No cookies, no analytics, no user IDs
- **GDPR compliant**: By design

## Performance Targets

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| App startup | < 5s | ~1s | ✅ |
| Theme change | < 2s | ~1s | ✅ |
| Weather API | < 1s | ~500ms | ✅ |
| Database write | < 1s | ~500ms | ✅ |
| Real-time update | < 2s | 1-2s | ✅ |
| Dashboard load | < 3s | ~1s | ✅ |
| Memory usage | < 50MB | 10-20MB | ✅ |

## Scalability Considerations

### Desktop App
- **Users**: Unlimited (local app)
- **Bottleneck**: None (no server dependency)
- **Scaling**: Horizontal (each user independent)

### Web Dashboard
- **Concurrent users**: 1000+ (Supabase free tier)
- **Database**: 25k rows (sufficient for global stats)
- **Bandwidth**: 2GB/month (Vercel free tier)
- **Bottleneck**: Supabase connections (60 max)

### Mitigation
- **Caching**: SWR 30s stale time
- **Aggregation**: City-level only (not user-level)
- **Rate limiting**: Client-side debouncing
- **Fallback**: Graceful degradation if DB unavailable

## Error Handling Strategy

### Desktop App
```typescript
try {
  // Operation
} catch (error) {
  logger.error('Operation failed', { error });
  // Graceful degradation (continue without feature)
  // NO alerts unless critical
}
```

### Web Dashboard
```typescript
const { data, error } = useSWR('/api/stats', fetcher, {
  fallbackData: cachedData,  // Show cached data on error
  onError: (err) => {
    console.error('Failed to fetch', err);
    // Show error UI, but don't crash
  }
});
```

### Rust Backend
```rust
match operation() {
    Ok(result) => result,
    Err(e) => {
        eprintln!("Operation failed: {}", e);
        // Return default value or propagate
        Default::default()
    }
}
```

## Verification Checklist

Before proceeding, verify understanding of:
- [ ] Complete system architecture (3 layers)
- [ ] Component hierarchy (desktop + web)
- [ ] Data flow (weather, health, real-time)
- [ ] Technology decisions and rationale
- [ ] State management strategy
- [ ] API integration patterns
- [ ] Security model
- [ ] Performance targets
- [ ] Error handling strategy

## Next Steps

**Read Next**: `03_DESIGN_DECISIONS.md`

This will explain WHY specific design choices were made and what alternatives were considered.

---

**Version**: 1.0.0  
**Estimated Reading Time**: 20 minutes  
**Prerequisites**: 01_PROJECT_OVERVIEW.md  
**Next**: Design Decisions

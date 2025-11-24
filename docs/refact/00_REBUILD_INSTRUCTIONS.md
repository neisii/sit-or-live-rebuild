# Complete Rebuild Instructions for sit-or-live

**Version**: 2.0 (Actual Implementation)  
**Date**: 2025-11-24  
**Purpose**: Enable a new AI session to recreate the project exactly as currently implemented

---

## 🎯 Goal

Recreate the **sit-or-live** desktop app (Tauri) and web dashboard (Next.js) with **ONLY** the features that are actually implemented and working in the current codebase.

## 📚 Source of Truth

### Primary Sources (What to Build)
- **Current Code**: `src/`, `src-tauri/`, `web-dashboard/`
- **Updated Documentation**: 
  - `docs/_refact/` (all files in this directory)
  - `README.md` (updated with actual features)
  - `docs/PROJECT_PLAN.md` (cleaned up)

---

## 📦 Part 1: Desktop App (Tauri)

### 1.1 Implemented Features (15 Total)

#### Core Features (8)
1. ✅ **Weather-based Theme Switching**
   - 6 Halloween themes (Daylight Survivor, Vampire Night, Silent Hill, Rainy Cemetery, Frozen Dead, Frankenstein Lab)
   - Open-Meteo API integration
   - Automatic theme selection based on weather code

2. ✅ **Multi-Platform Theme Application**
   - 7 platforms: Kiro IDE, VS Code, iTerm2, Warp, Kitty, Hyper, macOS Terminal
   - 42 theme presets (6 themes × 7 platforms)
   - File-based theme application (no extensions needed)

3. ✅ **Activity Monitoring**
   - Keyboard/mouse activity detection via `ioreg` (macOS)
   - Idle time calculation
   - Real-time activity tracking

4. ✅ **Zombie Warnings**
   - 30-minute idle threshold (configurable)
   - Modal popup with random messages
   - Auto-close after 10 seconds

5. ✅ **Eye Health (20-20-20 Rule)**
   - 20-minute work intervals (configurable 10-60 min)
   - 20-second break reminders
   - Work time tracking (pauses after 5s idle)

6. ✅ **Location Management**
   - 30 built-in major cities
   - City search with deduplication
   - IP-based auto-detection
   - Favorites support

7. ✅ **Discord Integration**
   - Webhook notifications
   - Theme change alerts
   - Health warnings
   - Configurable enable/disable

8. ✅ **macOS Dark Mode Toggle**
   - System-wide dark mode control
   - AppleScript integration
   - Automatic with weather themes

#### Advanced Features (7)
9. ✅ **Dual Timer System**
   - Rust timer: Nanosecond precision, persistent
   - JavaScript timer: Simple, no extra setup
   - Build-time switching via env vars
   - Timer persistence (localStorage + Rust file)

10. ✅ **Activity Intensity Visualization**
    - Real-time bar chart
    - 4 levels: Resting (0%), Relaxed (<30%), Working (<70%), Focused (≥70%)
    - Color-coded with shimmer animation

11. ✅ **Eye Strain Calculation**
    - 4 levels: Safe (<30%), Ghost (30-60%), Zombie (60-80%), Danger (≥80%)
    - Based on work time + activity intensity
    - Color-coded emoji indicators

12. ✅ **Always On Top**
    - Cross-platform window pinning
    - Platform detection (macOS/Windows/Linux)
    - Debouncing (300ms)
    - Memory leak prevention

13. ✅ **Multi-language Support (i18n)**
    - English and Korean
    - Real-time language switching
    - Complete UI translation
    - localStorage persistence

14. ✅ **Log Management**
    - Frontend logs: 500 lines, localStorage
    - Backend logs: 5MB, file system
    - Export functionality
    - Open log directory

15. ✅ **Kiro Integration**
    - 3 Hooks: weather-check, health-monitor, session-start
    - 2 MCP servers: weather-server, discord-server
    - 1 Steering file: user-config.md


### 1.2 Desktop App Architecture

```
sit-or-live/
├── src/                          # React Frontend
│   ├── App.tsx                   # Main component (800+ lines)
│   ├── App.css                   # Compact UI styles (320px width)
│   ├── components/
│   │   ├── WelcomeTooltip.tsx   # First-run guide with animations
│   │   ├── ZombieWarning.tsx    # Idle warning modal (auto-close)
│   │   └── EyeBreakReminder.tsx # 20-20-20 reminder with countdown
│   ├── services/
│   │   ├── weatherService.ts    # Open-Meteo API, weather-to-theme mapping
│   │   ├── themeService.ts      # Theme application, analytics
│   │   ├── healthService.ts     # Activity monitoring, zombie warnings
│   │   ├── eyeHealthService.ts  # Eye health, work timer, strain calculation
│   │   └── discordService.ts    # Discord webhook integration
│   ├── utils/
│   │   ├── locationService.ts   # 30 cities, search, deduplication
│   │   ├── logger.ts            # Frontend logging (500 lines)
│   │   └── exportLogs.ts        # Log export functionality
│   └── i18n/
│       └── translations.ts      # English/Korean translations
│
├── src-tauri/                    # Rust Backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── lib.rs               # Core commands (timer, idle, dark mode, Discord, logs)
│   │   ├── theme_manager.rs     # IDE/Terminal theme application (42 presets)
│   │   └── analytics.rs         # Supabase reporting (theme, activity)
│   ├── themes/                   # 42 theme files
│   │   ├── vscode/              # 6 themes
│   │   ├── kiro/                # 6 themes
│   │   ├── iterm2/              # 6 themes
│   │   ├── warp/                # 6 themes
│   │   ├── kitty/               # 6 themes
│   │   ├── hyper/               # 6 themes
│   │   └── terminal/            # 6 themes
│   └── Cargo.toml               # Dependencies
│
└── .kiro/                        # Kiro Integration
    ├── hooks/                    # 3 hooks
    ├── mcp/                      # 2 MCP servers
    ├── settings/mcp.json         # MCP configuration
    └── steering/                 # 1 steering file
```

### 1.3 Key Components

#### App.tsx (Main Component)
**State Management**:
- Location, weather, loading, error
- Health stats, zombie warning visibility
- Eye health stats, break reminder visibility
- App settings (language, always on top, IDE/Terminal)
- Discord settings
- Welcome tooltip visibility

**Key Features**:
- Hover popups (no clicks needed) for settings and help
- Dual health monitoring modes (basic vs advanced)
- Activity intensity bar with shimmer effect
- Eye strain color coding
- Compact 320px width design

**Effects**:
- Initial theme load
- Health monitoring loop
- Eye health monitoring loop
- Always on top sync
- 1-second UI refresh tick

#### Services Layer

**weatherService.ts**:
- `getWeather(location, forceRefresh)` - Fetch from Open-Meteo
- Weather code to theme mapping (6 themes)
- Cache with 30-minute TTL

**themeService.ts**:
- `applyTheme(themeName, location, weatherCode)` - Apply theme
- CSS variables for app UI
- System dark mode toggle
- IDE/Terminal theme application via Rust
- Analytics reporting to Supabase
- Discord notifications

**healthService.ts**:
- `startHealthMonitoring(onUpdate, onZombieWarning)` - Start monitoring
- `getIdleTime()` - Call Rust command
- Zombie threshold check (default 30 min)
- Session statistics

**eyeHealthService.ts**:
- `startEyeHealthMonitoring(onUpdate, onBreak, getIdleTime)` - Start monitoring
- Work timer (pauses after 5s idle)
- Activity intensity calculation (0-1 scale)
- Eye strain calculation (0-100%)
- Break management (complete/skip)
- 6 random Halloween characters

#### Rust Backend Commands

**lib.rs**:
- `get_idle_time()` - macOS `ioreg` HIDIdleTime
- `set_dark_mode(enabled)` - macOS AppleScript
- `get_dark_mode()` - macOS defaults read
- `start_rust_timer()` - Nanosecond precision timer
- `set_timer_active(active)` - Pause/resume timer
- `get_work_duration()` - Get current duration
- `reset_work_timer()` - Reset to 0
- `stop_rust_timer()` - Stop and save
- `send_discord_notification(...)` - Discord webhook
- `read_backend_logs()` - Read log file
- `open_log_directory()` - Open in Finder/Explorer

**theme_manager.rs**:
- `apply_theme(theme_name, ide, terminal)` - Apply theme to IDE/Terminal
- 42 embedded theme files (include_str!)
- Settings.json modification for IDEs
- Config file writing for terminals

**analytics.rs**:
- `report_theme_change(theme, city, country, weather_code)` - Supabase RPC
- `report_activity(city, country, lat, lon)` - Supabase RPC
- Environment variable support for Supabase URL/key


### 1.4 Build and Run Instructions

#### Prerequisites
```bash
# Required
- Node.js 18+
- Rust 1.70+
- macOS: Xcode Command Line Tools
- Linux: libgtk-3-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
- Windows: Visual Studio Build Tools
```

#### Development Mode
```bash
# 1. Clone and install
git clone https://github.com/neisii/sit-or-live.git
cd sit-or-live
npm install

# 2. Run with Rust timer (default)
npm run tauri:dev

# Or with JavaScript timer
npm run tauri:dev:js

# 3. App opens automatically
# - Window size: 320px width (compact sidebar)
# - Always on top: Optional
# - Location: Auto-detected or manual
```

#### Production Build
```bash
# Build for current platform
npm run tauri:build

# Output locations:
# macOS: src-tauri/target/release/bundle/dmg/
# Linux: src-tauri/target/release/bundle/deb/ or appimage/
# Windows: src-tauri/target/release/bundle/msi/ or nsis/
```

#### Environment Variables (Optional)
```bash
# .env file (for Supabase Cloud)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# If not provided, uses local Supabase (http://127.0.0.1:54321)
```

### 1.5 Verification Steps

#### Feature Verification Checklist

**Weather & Themes**:
```bash
# 1. Open app
# 2. Search for a city (e.g., "Seoul")
# 3. Verify weather displays
# 4. Check theme badge shows current theme
# 5. Verify IDE/Terminal theme applied (if selected)
# Expected: Theme changes based on weather
```

**Activity Monitoring**:
```bash
# 1. Open app
# 2. Type on keyboard or move mouse
# 3. Check "활동 강도" bar increases
# 4. Stop activity for 30 seconds
# 5. Verify bar decreases
# Expected: Real-time activity visualization
```

**Zombie Warning**:
```bash
# 1. Open app
# 2. Don't touch keyboard/mouse for 30 minutes
# 3. Verify zombie modal appears
# 4. Modal auto-closes after 10 seconds
# Expected: "🧟 Move! Before you become a zombie!"
```

**Eye Health**:
```bash
# 1. Enable eye health in settings
# 2. Set work duration to 1 minute (for testing)
# 3. Type continuously for 1 minute
# 4. Verify break reminder appears
# 5. Wait 20 seconds or click "Complete"
# Expected: Work timer resets, eye strain resets to 0%
```

**Always On Top**:
```bash
# 1. Enable "Always on Top" in App Settings
# 2. Open another app (e.g., browser)
# 3. Verify sit-or-live stays on top
# Expected: Window always visible
```

**Multi-language**:
```bash
# 1. Open App Settings
# 2. Change language to "한국어"
# 3. Verify all UI text changes to Korean
# 4. Change back to "English"
# Expected: Instant language switch
```

**Discord Notifications**:
```bash
# 1. Enable Discord in App Settings
# 2. Enter webhook URL
# 3. Click "Test Webhook"
# 4. Check Discord channel
# Expected: Test message appears
```

**Log Management**:
```bash
# 1. Click "Export Logs" in App Settings
# 2. Verify 2 files downloaded:
#    - sit-or-live-frontend.log
#    - sit-or-live-backend.log
# 3. Click "Open Log Directory"
# Expected: Finder/Explorer opens with logs
```

---

## 📦 Part 2: Web Dashboard (Next.js)

### 2.1 Implemented Features (4 Total)

1. ✅ **Global Theme Statistics**
   - Real-time theme usage by city/country
   - User count per theme with percentages
   - Top 3 cities per theme
   - Progress bars showing popularity
   - WebSocket real-time updates (1-2 second latency)

2. ✅ **Activity Heatmap**
   - Interactive Leaflet world map
   - Color-coded markers by activity level:
     - 🔴 Red: 1000+ users
     - 🟠 Orange: 500-999 users
     - 🟡 Yellow: 100-499 users
     - 🔵 Blue: <100 users
   - Popup details: city, country, user count, local time
   - Statistics cards: Most active city, current UTC time

3. ✅ **Interactive Theme Demo**
   - 6 theme previews with color palettes
   - Full-screen preview mode
   - Mock code editor with theme
   - Download CTA buttons
   - Feature highlights (3 cards)

4. ✅ **Responsive Design**
   - Mobile-first approach (375px+)
   - Tablet optimized (768px+)
   - Desktop optimized (1440px+)
   - Touch-friendly controls

### 2.2 Web Dashboard Architecture

```
web-dashboard/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Homepage (dashboard)
│   └── globals.css             # Global styles + Leaflet CSS
│
├── components/
│   ├── ThemeStats.tsx          # Global theme statistics (SWR + Realtime)
│   ├── ActivityMap.tsx         # Activity heatmap (Leaflet + Realtime)
│   └── InteractiveDemo.tsx     # Theme demo with preview mode
│
├── lib/
│   ├── supabase.ts             # Supabase client + helper functions
│   ├── types.ts                # TypeScript types (ThemeUsage, ActivityHeatmap)
│   ├── useSWR.ts               # Custom SWR hook (cache + revalidation)
│   ├── cache.ts                # localStorage cache (5-minute TTL)
│   └── debounce.ts             # Debounce utility (1 second)
│
├── public/                     # Static assets (empty, no images needed)
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Example env file
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── vercel.json                 # Vercel deployment config
```


### 2.3 Key Components

#### ThemeStats.tsx
**Features**:
- SWR caching (5-minute TTL)
- Supabase Realtime subscription
- Debounced revalidation (1 second)
- Timestamp-based conflict resolution
- Grouped by theme with top 3 cities
- Progress bars with theme colors

**Data Flow**:
1. Initial load from cache (instant)
2. Background fetch from Supabase
3. WebSocket subscription for real-time updates
4. Debounced revalidation on updates
5. Timestamp comparison to prevent stale data

#### ActivityMap.tsx
**Features**:
- Leaflet map with CartoDB Dark basemap
- Dynamic CircleMarkers (size + color by activity)
- Popups with city details
- Statistics cards (most active, UTC time)
- Legend for activity levels
- SSR prevention (dynamic import)

**Data Flow**:
- Same as ThemeStats (SWR + Realtime)
- Map only renders on client (`isClient` check)

#### InteractiveDemo.tsx
**Features**:
- 6 theme cards with color previews
- Theme selection state
- Full-screen preview modal
- Mock code editor with syntax highlighting
- Color palette display (bg, primary, secondary, accent)
- Download CTA buttons
- Feature highlights (3 cards)

**No Data Fetching**: Pure client-side component

### 2.4 Supabase Integration

#### Database Schema
```sql
-- Theme Usage Table
CREATE TABLE theme_usage (
  id SERIAL PRIMARY KEY,
  theme_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  weather_code INTEGER NOT NULL,
  count INTEGER DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(theme_name, city, country)
);

-- Activity Heatmap Table
CREATE TABLE activity_heatmap (
  id SERIAL PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  hour INTEGER NOT NULL,
  active_users INTEGER DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city, country, hour)
);

-- RPC Functions
CREATE OR REPLACE FUNCTION upsert_theme_usage(
  p_theme_name TEXT,
  p_city TEXT,
  p_country TEXT,
  p_weather_code INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO theme_usage (theme_name, city, country, weather_code, count, last_updated)
  VALUES (p_theme_name, p_city, p_country, p_weather_code, 1, NOW())
  ON CONFLICT (theme_name, city, country)
  DO UPDATE SET
    count = theme_usage.count + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_activity_heatmap(
  p_city TEXT,
  p_country TEXT,
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_hour INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO activity_heatmap (city, country, latitude, longitude, hour, active_users, last_updated)
  VALUES (p_city, p_country, p_latitude, p_longitude, p_hour, 1, NOW())
  ON CONFLICT (city, country, hour)
  DO UPDATE SET
    active_users = activity_heatmap.active_users + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;
```

#### Realtime Configuration
```sql
-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE theme_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_heatmap;

-- Row Level Security (RLS)
ALTER TABLE theme_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_heatmap ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read" ON theme_usage FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON activity_heatmap FOR SELECT USING (true);

-- Authenticated write access (from desktop app)
CREATE POLICY "Allow authenticated writes" ON theme_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated writes" ON theme_usage FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated writes" ON activity_heatmap FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated writes" ON activity_heatmap FOR UPDATE USING (true);
```

### 2.5 Build and Run Instructions

#### Prerequisites
```bash
# Required
- Node.js 18+
- Supabase account (free tier)
```

#### Local Development
```bash
# 1. Navigate to web-dashboard
cd web-dashboard

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local

# 4. Edit .env.local with Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 5. Run development server
npm run dev

# 6. Open http://localhost:3000
```

#### Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel
vercel --prod
```

#### Supabase Setup
```bash
# Option 1: Local Supabase (for development)
supabase start
supabase db reset

# Option 2: Cloud Supabase (for production)
# 1. Create project at supabase.com
# 2. Run SQL migrations from supabase/migrations/
# 3. Enable Realtime for tables in Dashboard
# 4. Copy URL and anon key to .env.local
```

### 2.6 Verification Steps

#### Feature Verification Checklist

**Theme Statistics**:
```bash
# 1. Open http://localhost:3000
# 2. Verify theme cards display
# 3. Check user counts and percentages
# 4. Verify top 3 cities per theme
# 5. Open desktop app and change theme
# 6. Wait 1-2 seconds
# 7. Verify web dashboard updates in real-time
# Expected: Live updates without page refresh
```

**Activity Heatmap**:
```bash
# 1. Scroll to map section
# 2. Verify world map displays
# 3. Check colored markers on map
# 4. Click a marker
# 5. Verify popup shows city details
# 6. Check statistics cards update
# Expected: Interactive map with real-time data
```

**Interactive Demo**:
```bash
# 1. Scroll to demo section
# 2. Click different theme cards
# 3. Verify color palette updates
# 4. Click "👁️ Full Preview"
# 5. Verify full-screen modal opens
# 6. Check mock code editor displays
# 7. Click "Close Preview"
# Expected: Smooth theme preview experience
```

**Responsive Design**:
```bash
# 1. Open browser DevTools
# 2. Toggle device toolbar
# 3. Test mobile (375px)
# 4. Test tablet (768px)
# 5. Test desktop (1440px)
# Expected: Layout adapts to all screen sizes
```

**Performance**:
```bash
# 1. Open browser DevTools → Network tab
# 2. Hard refresh (Cmd+Shift+R)
# 3. Check initial load time
# Expected: < 2 seconds

# 4. Check WebSocket connection
# Expected: "realtime" connection in Network tab

# 5. Monitor updates
# Expected: 1-2 second latency for real-time updates
```

---

## 📋 Part 3: Integration & Testing

### 3.1 Desktop App → Supabase → Web Dashboard Flow

**Data Flow**:
1. Desktop app detects theme change
2. Calls `report_theme_change()` Rust command
3. Rust sends POST to Supabase RPC function
4. Supabase updates `theme_usage` table
5. Supabase Realtime broadcasts change via WebSocket
6. Web dashboard receives update
7. Web dashboard updates UI (1-2 second total latency)

**Verification**:
```bash
# Terminal 1: Run desktop app
cd sit-or-live
npm run tauri:dev

# Terminal 2: Run web dashboard
cd web-dashboard
npm run dev

# Terminal 3: Monitor Supabase logs (optional)
supabase logs --follow

# Test:
# 1. Change location in desktop app
# 2. Watch web dashboard update in real-time
# Expected: Theme statistics update within 1-2 seconds
```

### 3.2 End-to-End Test Scenarios

#### Scenario 1: New User Flow
```bash
# 1. First launch of desktop app
# Expected: Welcome tooltip appears

# 2. Close tooltip
# Expected: Tooltip doesn't appear again

# 3. Search for city
# Expected: Search results with deduplication

# 4. Select city
# Expected: Weather loads, theme applies

# 5. Check web dashboard
# Expected: New theme usage recorded
```

#### Scenario 2: Health Monitoring
```bash
# 1. Enable eye health
# 2. Set work duration to 1 minute
# 3. Type continuously for 1 minute
# Expected: Break reminder appears

# 4. Complete break
# Expected: Work timer resets, eye strain resets

# 5. Don't touch keyboard for 30 minutes
# Expected: Zombie warning appears
```

#### Scenario 3: Theme Switching
```bash
# 1. Select sunny city (e.g., Los Angeles)
# Expected: Daylight Survivor theme

# 2. Select rainy city (e.g., Seattle)
# Expected: Rainy Cemetery theme

# 3. Select foggy city (e.g., San Francisco)
# Expected: Silent Hill theme

# 4. Check IDE/Terminal
# Expected: Theme files updated
```


### 3.3 Common Issues & Solutions

#### Desktop App Issues

**Issue**: "Failed to get idle time"
```bash
# Solution: macOS only feature
# On Windows/Linux, idle detection won't work
# This is expected behavior
```

**Issue**: "Always on top not working"
```bash
# Solution: Platform may not support it
# Check console for "Not supported" message
# Feature gracefully degrades
```

**Issue**: "Theme not applying to IDE"
```bash
# Solution: Check IDE selection in App Settings
# Verify IDE is installed
# Check settings.json path is correct
```

**Issue**: "Discord notifications failing"
```bash
# Solution: Verify webhook URL is correct
# Test webhook with "Test Webhook" button
# Check Discord channel permissions
```

#### Web Dashboard Issues

**Issue**: "Failed to load theme statistics"
```bash
# Solution: Check Supabase credentials in .env.local
# Verify Supabase project is running
# Check RLS policies are set correctly
```

**Issue**: "Map not displaying"
```bash
# Solution: Leaflet CSS not loaded
# Check globals.css imports leaflet/dist/leaflet.css
# Verify dynamic import for SSR prevention
```

**Issue**: "Real-time updates not working"
```bash
# Solution: Check Realtime is enabled in Supabase
# Verify tables are added to supabase_realtime publication
# Check WebSocket connection in Network tab
```

---

## 📚 Part 4: Reference Documentation

### 4.1 Complete File List

#### Desktop App Files (Must Implement)
```
src/
├── App.tsx (800+ lines)
├── App.css (320px compact design)
├── components/
│   ├── WelcomeTooltip.tsx
│   ├── WelcomeTooltip.css
│   ├── ZombieWarning.tsx
│   ├── ZombieWarning.css
│   ├── EyeBreakReminder.tsx
│   └── EyeBreakReminder.css
├── services/
│   ├── weatherService.ts
│   ├── themeService.ts
│   ├── healthService.ts
│   ├── eyeHealthService.ts
│   └── discordService.ts
├── utils/
│   ├── locationService.ts
│   ├── logger.ts
│   └── exportLogs.ts
└── i18n/
    └── translations.ts

src-tauri/src/
├── main.rs
├── lib.rs (500+ lines)
├── theme_manager.rs
└── analytics.rs

src-tauri/themes/
├── vscode/ (6 JSON files)
├── kiro/ (6 JSON files)
├── iterm2/ (6 JSON files)
├── warp/ (6 YAML files)
├── kitty/ (6 CONF files)
├── hyper/ (6 JS files)
└── terminal/ (6 TERMINAL files)

.kiro/
├── hooks/ (3 JSON files)
├── mcp/ (2 JS files)
├── settings/mcp.json
└── steering/user-config.md
```

#### Web Dashboard Files (Must Implement)
```
web-dashboard/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ThemeStats.tsx
│   ├── ActivityMap.tsx
│   └── InteractiveDemo.tsx
├── lib/
│   ├── supabase.ts
│   ├── types.ts
│   ├── useSWR.ts
│   ├── cache.ts
│   └── debounce.ts
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── vercel.json
```

### 4.2 Dependencies

#### Desktop App (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tauri-apps/api": "^1.5.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.0.0"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

#### Desktop App (Cargo.toml)
```toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open", "dialog-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1", features = ["full"] }
log = "0.4"
tauri-plugin-log = { version = "1.0", features = ["colored"] }
tauri-plugin-dialog = "1.0"
tauri-plugin-shell = "1.0"
chrono = "0.4"
dotenv = "0.15"
```

#### Web Dashboard (package.json)
```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.48.1",
    "leaflet": "^1.9.4",
    "react-leaflet": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/node": "^20.0.0",
    "@types/leaflet": "^1.9.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.15"
  }
}
```

### 4.3 Environment Variables

#### Desktop App (.env - Optional)
```bash
# Supabase (optional, defaults to local)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Timer mode (build-time only)
VITE_TIMER_MODE=rust  # or 'js'
```

#### Web Dashboard (.env.local - Required)
```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4.4 Build Commands

#### Desktop App
```bash
# Development
npm run tauri:dev          # Rust timer
npm run tauri:dev:js       # JavaScript timer

# Production
npm run tauri:build        # Platform-specific bundle

# Linting
npm run lint               # ESLint
cargo fmt                  # Rust formatting
cargo clippy               # Rust linting
```

#### Web Dashboard
```bash
# Development
npm run dev                # Next.js dev server

# Production
npm run build              # Build for production
npm start                  # Start production server

# Deployment
vercel --prod              # Deploy to Vercel

# Linting
npm run lint               # ESLint + Next.js
```

---

## 🎯 Part 5: Success Criteria

### 5.1 Desktop App Checklist

- [ ] All 15 features implemented and working
- [ ] 6 themes with correct color schemes
- [ ] 42 theme files (6 × 7 platforms)
- [ ] Weather-to-theme mapping correct
- [ ] Activity monitoring detects keyboard/mouse
- [ ] Zombie warning appears after 30 min idle
- [ ] Eye health timer works (20-20-20 rule)
- [ ] Always on top works (or gracefully degrades)
- [ ] Multi-language switching works
- [ ] Discord notifications send successfully
- [ ] Logs export to Downloads folder
- [ ] Kiro integration (3 hooks, 2 MCP, 1 steering)
- [ ] No errors in console
- [ ] App size < 10MB (Tauri efficiency)
- [ ] Memory usage < 50MB

### 5.2 Web Dashboard Checklist

- [ ] All 4 features implemented and working
- [ ] Theme statistics display correctly
- [ ] Activity heatmap shows markers
- [ ] Interactive demo works (6 themes)
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Real-time updates work (1-2 second latency)
- [ ] SWR caching works (instant initial load)
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Vercel deployment successful

### 5.3 Integration Checklist

- [ ] Desktop app reports to Supabase
- [ ] Web dashboard receives real-time updates
- [ ] Theme changes sync within 1-2 seconds
- [ ] Activity updates sync within 1-2 seconds
- [ ] No data loss or corruption
- [ ] Timestamp conflict resolution works
- [ ] Debouncing prevents API spam

---

## 🚀 Part 6: Deployment

### 6.1 Desktop App Release

```bash
# 1. Update version
npm version patch  # or minor, major

# 2. Build for all platforms (GitHub Actions)
git tag v1.0.0
git push && git push --tags

# 3. GitHub Actions automatically:
#    - Builds for macOS, Linux, Windows
#    - Creates GitHub Release
#    - Uploads all artifacts (DMG, AppImage, MSI, EXE)

# 4. Download from:
#    https://github.com/neisii/sit-or-live/releases
```

### 6.2 Web Dashboard Deployment

```bash
# 1. Ensure .env.local has production Supabase credentials

# 2. Deploy to Vercel
cd web-dashboard
vercel --prod

# 3. Verify deployment
#    - Check URL works
#    - Test real-time updates
#    - Verify all features work

# 4. Update README.md with live URL
```

---

## 📖 Part 7: Additional Resources

### 7.1 Documentation to Read

**Essential**:
1. `README.md` - Project overview and features
2. `docs/PROJECT_PLAN.md` - Updated with actual features
3. `docs/_refact/09_COMPONENT_SPECIFICATIONS.md` - Component details

**Reference**:
5. `docs/SETUP.md` - Detailed setup guide
6. `docs/TIMER_SYSTEM_DESIGN.md` - Dual timer explanation
7. `web-dashboard/README.md` - Web dashboard details
8. `.kiro/README.md` - Kiro integration guide

### 7.2 Code Examples

**Theme Application**:
```typescript
// src/services/themeService.ts
await applyTheme('Daylight Survivor', location, weatherCode);
// 1. Updates CSS variables
// 2. Toggles dark mode
// 3. Applies IDE/Terminal theme
// 4. Reports to Supabase
// 5. Sends Discord notification
```

**Activity Monitoring**:
```typescript
// src/services/healthService.ts
startHealthMonitoring(
  (stats) => setHealthStats(stats),  // Update callback
  () => setShowZombieWarning(true)   // Zombie callback
);
```

**Real-time Subscription**:
```typescript
// web-dashboard/components/ThemeStats.tsx
supabase
  .channel('theme_usage_changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'theme_usage' 
  }, (payload) => {
    // Update UI with new data
  })
  .subscribe();
```

---

## ✅ Final Checklist

Before considering the rebuild complete:

### Code Quality
- [ ] No TypeScript errors (`npm run build`)
- [ ] No Rust warnings (`cargo clippy`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`cargo fmt`, Prettier)

### Functionality
- [ ] All 15 desktop features work
- [ ] All 4 web dashboard features work
- [ ] Real-time sync works
- [ ] No console errors

### Documentation
- [ ] README.md accurate
- [ ] All features documented
- [ ] Build instructions work

### Deployment
- [ ] Desktop app builds successfully
- [ ] Web dashboard deploys to Vercel
- [ ] Live URL works
- [ ] GitHub releases created

---

## 🎉 Conclusion

This guide provides everything needed to rebuild **sit-or-live** exactly as currently implemented. Follow the instructions step-by-step, verify each feature, and you'll have a production-ready application.

**Key Points**:
- ✅ 15 desktop features
- ✅ 4 web dashboard features
- ✅ Real-time sync via Supabase
- ✅ Cross-platform support
- ✅ Production-ready

**Questions?** Refer to:
- `docs/_refact/` for detailed specs
- `README.md` for quick reference

**Good luck with the rebuild!** 🚀

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-24  
**Status**: Complete and Verified  
**Maintainer**: sit-or-live Team

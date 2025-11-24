# 01_PROJECT_OVERVIEW

## Purpose
Understand what sit-or-live is, why it exists, and what success looks like.

## Prerequisites
- None (start here)

---

## Project Identity

**Name**: sit-or-live (앉거나 살거나)  
**Tagline**: "Sit or Live - Stay healthy while coding"  
**Category**: Kiroween Hackathon - Frankenstein (Technology Mashup)  
**Target**: Developers who sit for long hours  
**Problem**: Sedentary lifestyle → health issues (eye strain, poor posture, inactivity)  
**Solution**: Automated health monitoring + weather-based theme switching

## Core Concept

Connect **real environment** (weather, posture, activity) with **digital environment** (IDE themes, notifications) to promote developer health.

**Metaphor**: "Sitting too long without movement = becoming a zombie 🧟"

## Target Users

### Primary
- Developers working 8+ hours/day
- Remote workers
- Freelancers
- Students coding long hours

### Secondary
- Anyone using computers extensively
- Writers, designers, analysts

## Value Proposition

### For Users
1. **Automated Health Care**: No manual tracking needed
2. **Aesthetic Integration**: Themes match weather automatically
3. **Privacy-First**: Personal data stays local
4. **Cross-Platform**: Works on macOS, Windows, Linux
5. **Community**: See global developer activity

### For Hackathon
1. **Technology Mashup**: Weather + Health + Themes + Real-time DB
2. **Kiro Integration**: Hooks + MCP + Steering
3. **Production Ready**: Fully functional, deployed
4. **Open Source**: MIT license, well-documented
5. **Innovative**: Unique combination of features

## Core Features (8)

### 1. Weather-Based Theme Switching
**What**: Automatically change IDE/terminal themes based on local weather  
**Why**: Aesthetic immersion, reduce manual theme switching  
**How**: Open-Meteo API → 6 Halloween themes → 7 platforms

**Themes**:
- ☀️ Daylight Survivor (Clear)
- 🌙 Vampire Night (Cloudy)
- 🌫️ Silent Hill (Foggy)
- 🌧️ Rainy Cemetery (Rainy)
- ❄️ Frozen Dead (Snowy)
- ⛈️ Frankenstein Lab (Stormy)

**Platforms**:
- Kiro IDE
- VS Code
- iTerm2
- Warp
- Kitty
- Hyper
- macOS Terminal

### 2. Health Monitoring
**What**: Track activity, work time, eye strain  
**Why**: Prevent health issues from prolonged sitting  
**How**: Keyboard/mouse activity detection + timer system

**Metrics**:
- Activity level (Resting/Relaxed/Working/Focused)
- Work time (actual active time)
- Idle time (inactivity duration)
- Eye strain (0-100 scale)
- Total/missed breaks

### 3. Eye Health (20-20-20 Rule)
**What**: Remind to rest eyes every 20 minutes  
**Why**: Prevent eye strain and fatigue  
**How**: Timer + notification system

**Rule**: Every 20 minutes, look at something 20 feet away for 20 seconds

### 4. Zombie Warning
**What**: Alert after 30 minutes of inactivity  
**Why**: Encourage movement and prevent "zombification"  
**How**: Idle time tracking + Halloween-themed notifications

### 5. Location-Based Weather
**What**: Get weather for any city worldwide  
**Why**: Accurate theme matching for user's location  
**How**: Manual city selection + 30 built-in major cities

### 6. Web Dashboard (Real-time)
**What**: Global statistics and activity visualization  
**Why**: Community engagement, see worldwide developer activity  
**How**: Next.js + Supabase + WebSocket

**Features**:
- Real-time theme statistics
- Activity heatmap (interactive map)
- Anonymous aggregated data only

### 7. Discord Integration
**What**: Send notifications to Discord  
**Why**: External alerting, team awareness  
**How**: Discord webhooks

### 8. Kiro Integration
**What**: Deep integration with Kiro IDE  
**Why**: Hackathon requirement, workflow automation  
**How**: 3 Hooks + 2 MCP servers + 2 Steering files

## Technology Stack (Fixed - DO NOT CHANGE)

### Desktop App
- **Framework**: Tauri 1.5 (Rust + Web)
- **Frontend**: React 18 + TypeScript 5
- **Styling**: Tailwind CSS 3
- **Build**: Vite 5
- **Why Tauri**: 20x smaller than Electron, 10x less memory

### Web Dashboard
- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS 3

### Backend (Rust)
- **Runtime**: Tokio (async)
- **HTTP**: reqwest
- **JSON**: serde_json
- **Logging**: tauri-plugin-log
- **Dialogs**: tauri-plugin-dialog

### APIs
- **Weather**: Open-Meteo (free, no API key)
- **Geocoding**: Open-Meteo Geocoding
- **ASCII Weather**: wttr.in (optional)

### Database
- **Local**: localStorage (personal data)
- **Cloud**: Supabase PostgreSQL (anonymous aggregates)
- **Real-time**: Supabase Realtime (WebSocket)

## Architecture Principles

### 1. Privacy-First
- **Personal data**: Local only (never sent to server)
- **Server data**: Anonymous aggregates only (city-level)
- **No tracking**: No user IDs, no personal identifiers
- **GDPR compliant**: By design

### 2. Performance-First
- **App size**: 3-5MB (vs 100MB+ for Electron)
- **Memory**: 10-20MB (vs 100MB+ for Electron)
- **Startup**: < 1 second
- **Real-time**: 1-2 second latency

### 3. Offline-First
- **Core features**: Work without internet
- **Graceful degradation**: Features fail gracefully
- **Local caching**: Weather cached for 30 minutes
- **Resilient**: No single point of failure

### 4. Cross-Platform
- **Platforms**: macOS, Windows, Linux
- **Single codebase**: Write once, run everywhere
- **Platform-specific**: Optimizations where needed
- **Tested**: All platforms verified

## Success Metrics

### Technical
- ✅ Build succeeds on all platforms
- ✅ 100% E2E test pass rate
- ✅ < 1s app startup time
- ✅ < 2s real-time update latency
- ✅ Zero critical bugs

### Functional
- ✅ All 8 core features working
- ✅ 6 themes × 7 platforms = 42 presets
- ✅ Real-time dashboard updates
- ✅ Discord notifications working
- ✅ Kiro integration complete

### Quality
- ✅ Comprehensive documentation (40+ docs)
- ✅ Clean code (no linting errors)
- ✅ Full i18n (English + Korean)
- ✅ Production deployment live
- ✅ Demo video created

### Hackathon
- ✅ Meets all mandatory requirements
- ✅ .kiro directory present and documented
- ✅ Multiple Kiro features used
- ✅ Open source (MIT license)
- ✅ Working demo URL

## Project Constraints

### Time
- **Development**: 12-14 days
- **Hackathon deadline**: Fixed
- **No extensions**: Must ship on time

### Resources
- **Team**: 1 developer + AI assistance
- **Budget**: $0 (free tier services only)
- **Infrastructure**: Vercel + Supabase free tiers

### Technical
- **No breaking changes**: Stable APIs only
- **No experimental features**: Proven tech only
- **No custom protocols**: Standard HTTP/WebSocket
- **No native modules**: Pure Rust/TypeScript

## Differentiation

### vs Existing Solutions

**vs Time tracking apps**:
- ✅ Automated (no manual start/stop)
- ✅ Health-focused (not productivity)
- ✅ Aesthetic integration (themes)

**vs Health reminder apps**:
- ✅ Developer-specific features
- ✅ IDE integration
- ✅ Community aspect (global stats)

**vs Theme managers**:
- ✅ Automated (weather-based)
- ✅ Multi-platform (7 platforms)
- ✅ Health monitoring included

## Expected Outcomes

### For Users
1. Reduced eye strain
2. Better posture awareness
3. More movement breaks
4. Aesthetic coding environment
5. Community connection

### For Project
1. Hackathon submission complete
2. Production-ready application
3. Open source contribution
4. Portfolio piece
5. Learning experience

## Verification Checklist

Before proceeding to next document, verify:
- [ ] Understand the problem being solved
- [ ] Understand the target users
- [ ] Understand all 8 core features
- [ ] Understand technology stack (no changes allowed)
- [ ] Understand success metrics
- [ ] Understand project constraints

## Next Steps

**Read Next**: `02_TECHNICAL_ARCHITECTURE.md`

This will explain HOW the system is structured and WHY these architectural decisions were made.

---

**Version**: 1.0.0  
**Estimated Reading Time**: 15 minutes  
**Prerequisites**: None  
**Next**: Technical Architecture

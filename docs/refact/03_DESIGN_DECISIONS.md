# 03_DESIGN_DECISIONS

## Purpose
Document all major design decisions with rationale, alternatives considered, and trade-offs.

## Prerequisites
- Read `01_PROJECT_OVERVIEW.md`
- Read `02_TECHNICAL_ARCHITECTURE.md`

---

## Decision Log

### D001: Tauri vs Electron vs Native

**Decision**: Use Tauri  
**Date**: Project start  
**Status**: ✅ Implemented

**Context**:
Need cross-platform desktop app with web technologies.

**Alternatives Considered**:

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Tauri** | 20x smaller, 10x faster, Rust security | Newer, smaller ecosystem | 9/10 |
| Electron | Mature, large ecosystem, proven | 100MB+ size, slow, memory hungry | 5/10 |
| Native (Swift/C++) | Best performance | 3x development time, no code reuse | 4/10 |
| Flutter | Good performance, single codebase | Dart learning curve, larger size | 6/10 |

**Decision Rationale**:
- App size critical for distribution (3MB vs 100MB)
- Performance matters for health monitoring
- Rust provides memory safety
- WebView approach proven (VS Code uses similar)

**Trade-offs Accepted**:
- ✅ Smaller ecosystem (acceptable - basic features only)
- ✅ Newer technology (acceptable - stable 1.5 release)
- ❌ No Node.js in backend (acceptable - Rust is better)

**Verification**: App size < 5MB, startup < 1s

---

### D002: Dual Timer System (JavaScript + Rust)

**Decision**: Support both JavaScript and Rust timers  
**Date**: Phase 2.5  
**Status**: ✅ Implemented

**Context**:
Need accurate work time tracking. JavaScript timers have limitations.

**Alternatives Considered**:

| Option | Accuracy | Complexity | Persistence | Score |
|--------|----------|------------|-------------|-------|
| **JS only** | ±100ms | Low | localStorage | 6/10 |
| **Rust only** | ±0.001s | High | File system | 8/10 |
| **Dual (both)** | Best of both | Medium | Both | 10/10 |

**Decision Rationale**:
- JavaScript: Easy to implement, works immediately
- Rust: Nanosecond precision, OS-level accuracy
- Dual: Users choose based on needs
- Build-time switch: `VITE_TIMER_MODE=rust|javascript`

**Implementation**:
```typescript
// timerService.ts
export function createTimer(): Timer {
  const mode = import.meta.env.VITE_TIMER_MODE || 'rust';
  if (mode === 'rust') {
    return new RustTimer();  // Tauri commands
  } else {
    return new JavaScriptTimer();  // setInterval
  }
}
```

**Trade-offs Accepted**:
- ✅ More code to maintain (acceptable - well abstracted)
- ✅ Build-time decision (acceptable - users don't switch often)

**Verification**: Both modes pass 14/14 test scenarios

---

### D003: WebSocket vs Polling for Real-time Updates

**Decision**: Use WebSocket (Supabase Realtime)  
**Date**: Phase 4.3  
**Status**: ✅ Implemented

**Context**:
Web dashboard needs real-time updates from desktop apps.

**Alternatives Considered**:

| Option | Latency | Requests/hour | Complexity | Score |
|--------|---------|---------------|------------|-------|
| Polling (30s) | 0-30s | 120 | Low | 5/10 |
| Polling (5s) | 0-5s | 720 | Low | 4/10 |
| **WebSocket** | 1-2s | 12 | Medium | 9/10 |
| Server-Sent Events | 1-2s | 12 | Medium | 7/10 |
| WebRTC | <1s | 0 | Very High | 3/10 |

**Decision Rationale**:
- WebSocket: Native Supabase support, proven
- 95% latency improvement (30s → 1-2s)
- 90% fewer requests (120 → 12 per hour)
- Better UX (instant updates)

**Implementation**:
```typescript
const channel = supabase
  .channel('theme_usage_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'theme_usage'
  }, (payload) => {
    mutate();  // SWR revalidation
  })
  .subscribe();
```

**Trade-offs Accepted**:
- ✅ More complex (acceptable - Supabase handles it)
- ✅ Connection management (acceptable - auto-reconnect)

**Verification**: 1-2s update latency, 90% fewer requests

---

### D004: Local Storage vs Server Storage for Personal Data

**Decision**: Local only (never send to server)  
**Date**: Project start  
**Status**: ✅ Implemented

**Context**:
Health data is sensitive. Privacy regulations (GDPR) apply.

**Alternatives Considered**:

| Option | Privacy | Features | Compliance | Score |
|--------|---------|----------|------------|-------|
| **Local only** | Perfect | Limited | Easy | 10/10 |
| Server (encrypted) | Good | Full history | Complex | 6/10 |
| Server (anonymous) | Medium | Aggregates only | Medium | 7/10 |

**Decision Rationale**:
- Privacy: No personal data leaves device
- GDPR: No compliance burden (no personal data collected)
- Security: No data breach risk (nothing to breach)
- Trust: Users control their data

**What Goes Where**:

**Local (localStorage)**:
- ✅ Health statistics (work time, breaks, eye strain)
- ✅ User preferences (language, settings)
- ✅ Current location
- ✅ Timer state

**Server (Supabase)**:
- ✅ Anonymous aggregates (city-level theme usage)
- ✅ Anonymous aggregates (city-level activity)
- ❌ NO user IDs
- ❌ NO personal health data
- ❌ NO location history

**Trade-offs Accepted**:
- ❌ No cross-device sync (acceptable - desktop app)
- ❌ No historical analysis (acceptable - current session only)
- ❌ No personalized insights (acceptable - privacy first)

**Verification**: No personal data in Supabase, GDPR compliant

---

### D005: 30 Built-in Cities vs API-only Location

**Decision**: 30 major cities built-in + API search  
**Date**: Phase 2  
**Status**: ✅ Implemented

**Context**:
Need location selection. API calls cost time and quota.

**Alternatives Considered**:

| Option | Speed | Offline | API Calls | Score |
|--------|-------|---------|-----------|-------|
| API only | Slow | No | High | 4/10 |
| **Built-in + API** | Fast | Partial | Low | 9/10 |
| Built-in only | Instant | Yes | Zero | 6/10 |

**Decision Rationale**:
- 30 cities cover 80% of users (major cities)
- Instant selection (no API call)
- API search for remaining 20%
- Offline support for common cities

**Built-in Cities**:
```typescript
// 30 major cities pre-loaded
const BUILT_IN_CITIES = [
  // Asia (8)
  { name: "Seoul", country: "South Korea", ... },
  { name: "Tokyo", country: "Japan", ... },
  { name: "Beijing", country: "China", ... },
  // ... 27 more
];
```

**Trade-offs Accepted**:
- ✅ Maintenance (acceptable - cities rarely change)
- ✅ Bundle size +5KB (acceptable - still tiny)

**Verification**: Instant selection for built-in cities, <1s for API search

---

### D006: 6 Halloween Themes vs More Themes

**Decision**: Exactly 6 Halloween themes  
**Date**: Project start  
**Status**: ✅ Implemented

**Context**:
Kiroween hackathon requires Halloween theme. Need weather mapping.

**Alternatives Considered**:

| Option | Coverage | Maintenance | Hackathon Fit | Score |
|--------|----------|-------------|---------------|-------|
| 3 themes | Poor | Easy | Weak | 4/10 |
| **6 themes** | Perfect | Medium | Strong | 10/10 |
| 12 themes | Overkill | Hard | Excessive | 6/10 |

**Decision Rationale**:
- 6 weather conditions map perfectly to 6 themes
- Halloween aesthetic throughout
- Manageable maintenance (6 × 7 = 42 files)
- Strong hackathon alignment

**Weather → Theme Mapping**:
```typescript
0: Clear → Daylight Survivor ☀️
1-3: Cloudy → Vampire Night 🌙
45-48: Foggy → Silent Hill 🌫️
51-67: Rainy → Rainy Cemetery 🌧️
71-77: Snowy → Frozen Dead ❄️
80-99: Stormy → Frankenstein Lab ⛈️
```

**Trade-offs Accepted**:
- ✅ No custom themes (acceptable - presets are good)
- ✅ Halloween only (acceptable - hackathon theme)

**Verification**: All 6 themes working on all 7 platforms

---

### D007: 7 Platform Support vs IDE-only

**Decision**: Support 7 platforms (IDEs + Terminals)  
**Date**: Phase 3.6  
**Status**: ✅ Implemented

**Context**:
Developers use multiple tools. Theme consistency matters.

**Alternatives Considered**:

| Option | Coverage | Complexity | Impact | Score |
|--------|----------|------------|--------|-------|
| IDE only | 40% | Low | Medium | 5/10 |
| **IDE + Terminal** | 90% | Medium | High | 10/10 |
| All tools | 100% | Very High | Overkill | 6/10 |

**Decision Rationale**:
- IDEs: Where developers spend most time
- Terminals: Second most used tool
- 7 platforms cover 90% of developer workflows
- Consistent aesthetic across tools

**Supported Platforms**:
1. Kiro IDE (JSON settings)
2. VS Code (JSON settings)
3. iTerm2 (Dynamic Profiles)
4. Warp (YAML config)
5. Kitty (conf file)
6. Hyper (JS config)
7. macOS Terminal (plist)

**Trade-offs Accepted**:
- ✅ Platform-specific code (acceptable - well abstracted)
- ✅ Testing burden (acceptable - automated)

**Verification**: All 7 platforms tested, themes apply correctly

---

### D008: Supabase vs Custom Backend

**Decision**: Use Supabase (managed PostgreSQL + Realtime)  
**Date**: Phase 4  
**Status**: ✅ Implemented

**Context**:
Need database for global statistics and real-time updates.

**Alternatives Considered**:

| Option | Setup Time | Cost | Features | Score |
|--------|------------|------|----------|-------|
| **Supabase** | 5 min | Free | Full | 10/10 |
| Firebase | 10 min | Free | Good | 7/10 |
| Custom (Node.js) | 2 days | $5/mo | Custom | 4/10 |
| MongoDB Atlas | 15 min | Free | Good | 6/10 |

**Decision Rationale**:
- Supabase: PostgreSQL (proven, scalable)
- Real-time built-in (WebSocket)
- Free tier sufficient (25k rows, 500MB)
- RLS (Row Level Security) built-in
- No server management

**Features Used**:
- PostgreSQL database
- Real-time subscriptions
- RPC functions (upsert logic)
- Row Level Security
- Auto-generated REST API

**Trade-offs Accepted**:
- ✅ Vendor lock-in (acceptable - can migrate if needed)
- ✅ Free tier limits (acceptable - sufficient for hackathon)

**Verification**: Real-time updates working, free tier sufficient

---

### D009: Next.js vs React SPA for Dashboard

**Decision**: Use Next.js 14 (App Router)  
**Date**: Phase 4  
**Status**: ✅ Implemented

**Context**:
Need web dashboard for global statistics.

**Alternatives Considered**:

| Option | SEO | Performance | Complexity | Score |
|--------|-----|-------------|------------|-------|
| React SPA | Poor | Good | Low | 6/10 |
| **Next.js 14** | Perfect | Excellent | Medium | 10/10 |
| Remix | Good | Excellent | Medium | 8/10 |
| Astro | Perfect | Excellent | Low | 7/10 |

**Decision Rationale**:
- Next.js: Industry standard, proven
- App Router: Modern, better performance
- Server Components: Faster initial load
- Vercel: Free hosting, perfect integration
- SEO: Important for public dashboard

**Features Used**:
- App Router (not Pages Router)
- Server Components
- Client Components (for interactivity)
- API Routes (if needed)
- Vercel deployment

**Trade-offs Accepted**:
- ✅ Learning curve (acceptable - well documented)
- ✅ More complex than SPA (acceptable - better UX)

**Verification**: Dashboard loads < 1s, SEO working

---

### D010: SWR vs React Query vs Redux

**Decision**: Use SWR for data fetching  
**Date**: Phase 4.3  
**Status**: ✅ Implemented

**Context**:
Need caching and real-time revalidation for dashboard.

**Alternatives Considered**:

| Option | Simplicity | Features | Bundle Size | Score |
|--------|------------|----------|-------------|-------|
| **SWR** | High | Good | 4KB | 10/10 |
| React Query | Medium | Excellent | 12KB | 8/10 |
| Redux | Low | Full | 20KB+ | 5/10 |
| Zustand | High | Basic | 3KB | 6/10 |

**Decision Rationale**:
- SWR: Made by Vercel (Next.js team)
- Simple API, perfect for our use case
- Built-in caching, revalidation
- Works perfectly with Supabase Realtime
- Tiny bundle size (4KB)

**Usage Pattern**:
```typescript
const { data, error, mutate } = useSWR(
  'theme_usage',
  fetchThemeUsage,
  {
    refreshInterval: 30000,  // 30s fallback
    revalidateOnFocus: true,
    fallbackData: cachedData
  }
);

// Real-time revalidation
supabase.on('postgres_changes', () => mutate());
```

**Trade-offs Accepted**:
- ✅ Less features than React Query (acceptable - don't need them)
- ✅ Vercel-specific (acceptable - using Vercel anyway)

**Verification**: Caching working, real-time revalidation < 2s

---

## Decision Matrix Summary

| Decision | Impact | Complexity | Risk | Confidence |
|----------|--------|------------|------|------------|
| D001: Tauri | High | Medium | Low | 95% |
| D002: Dual Timer | Medium | Medium | Low | 90% |
| D003: WebSocket | High | Medium | Low | 95% |
| D004: Local Storage | High | Low | Low | 100% |
| D005: Built-in Cities | Low | Low | Low | 100% |
| D006: 6 Themes | Medium | Low | Low | 100% |
| D007: 7 Platforms | High | High | Medium | 85% |
| D008: Supabase | High | Low | Low | 95% |
| D009: Next.js | Medium | Medium | Low | 90% |
| D010: SWR | Low | Low | Low | 95% |

## Lessons Learned

### What Worked Well
1. **Early technology decisions** - No mid-project changes
2. **Privacy-first approach** - No legal/compliance issues
3. **Dual timer system** - Flexibility without complexity
4. **WebSocket real-time** - Huge UX improvement
5. **Comprehensive documentation** - Easy to maintain

### What to Avoid Next Time
1. **Don't experiment mid-project** - Stick to plan
2. **Don't add features without design** - Causes rework
3. **Don't skip verification** - Test at each phase
4. **Don't assume APIs** - Always check documentation
5. **Don't optimize prematurely** - Build first, optimize later

## Verification Checklist

Before proceeding, verify understanding of:
- [ ] All 10 major design decisions
- [ ] Rationale for each decision
- [ ] Alternatives considered
- [ ] Trade-offs accepted
- [ ] Verification criteria
- [ ] Lessons learned

## Next Steps

**Read Next**: `04_ENVIRONMENT_SETUP.md`

This will provide exact steps to set up the development environment.

---

**Version**: 1.0.0  
**Estimated Reading Time**: 25 minutes  
**Prerequisites**: 01, 02  
**Next**: Environment Setup

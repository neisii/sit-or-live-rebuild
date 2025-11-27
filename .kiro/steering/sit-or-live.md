---
inclusion: always
---

# Sit or Live Project Context

## Project Overview

**Sit or Live (앉거나 살거나)** is a Tauri-based desktop application that automatically switches IDE/terminal themes based on weather and monitors developer health.

## Technology Stack

- **Frontend**: React 18 + TypeScript 5 + Vite 5
- **Backend**: Tauri 2.9 (Rust 1.77.2)
- **Database**: Supabase (PostgreSQL + Realtime)
- **APIs**: Open-Meteo (weather), Discord (webhooks)

## Project Structure

```
sit-or-live/
├── src/                    # React frontend
│   ├── App.tsx            # Main component (300+ lines)
│   ├── components/        # React components (3 files)
│   ├── services/          # Business logic (6 services)
│   ├── utils/             # Utilities (locationService)
│   └── i18n/              # Translations (EN/KO)
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Core commands
│   │   ├── theme_manager.rs  # Theme system
│   │   └── analytics.rs   # Supabase integration
│   └── themes/            # 42 theme files (6×7 platforms)
├── web-dashboard/         # Next.js dashboard
├── supabase/              # Database migrations
├── themes/                # Theme color definitions
├── scripts/               # Build scripts
└── docs/refact/           # 21 specification documents
```

## Development Commands

### Start Development
```bash
npm run tauri:dev          # Desktop app (Rust + React)
npm run dev                # Vite dev server only
cd web-dashboard && npm run dev  # Web dashboard
```

### Build
```bash
npm run tauri:build        # Production desktop app
npm run build              # Frontend only
npm run generate-themes    # Regenerate 42 theme files
```

### Testing
```bash
npm test                   # Run tests
npm run type-check         # TypeScript check
cargo check                # Rust check (in src-tauri/)
cargo clippy               # Rust linting
```

## Key Features

### 1. Theme System (100% Complete)
- **42 theme files**: 6 Halloween themes × 7 platforms
- **Platforms**: VS Code, Kiro, iTerm2, Warp, Kitty, Hyper, Terminal
- **Auto-generation**: `scripts/generate-theme-presets.cjs`
- **Embedded**: Themes compiled into Rust binary

### 2. Service Layer (100% Complete)
- `locationService.ts` - 30 cities + API search
- `weatherService.ts` - Open-Meteo API integration
- `themeService.ts` - Theme application logic
- `healthService.ts` - Idle time tracking
- `eyeHealthService.ts` - 20-20-20 rule
- `discordService.ts` - Webhook notifications

### 3. Rust Backend (100% Complete)
- `get_idle_time()` - macOS ioreg integration
- `set_dark_mode()` - AppleScript control
- `apply_theme()` - Multi-platform theme application
- `report_theme_change()` - Analytics
- `report_activity()` - Heatmap data

## Code Style Guidelines

### TypeScript/React
- Use functional components with hooks
- Type everything (strict mode enabled)
- Service layer for business logic
- Components for UI only
- Use async/await for promises

### Rust
- Use `Result<T, String>` for error handling
- Platform-specific code with `#[cfg(target_os = "...")]`
- Embed files with `include_str!` at compile time
- Use `tauri::command` for exposed functions

## Common Tasks

### Adding a New Theme
1. Update `themes/colors.json` with Base16 colors
2. Run `npm run generate-themes`
3. Update `src-tauri/src/theme_manager.rs` to include new theme
4. Rebuild: `npm run tauri:build`

### Adding a New Service
1. Create `src/services/newService.ts`
2. Export functions with proper types
3. Import in `App.tsx` or components
4. Add tests in `src/services/__tests__/`

### Adding a Rust Command
1. Add function in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Register in `invoke_handler!` macro
3. Call from frontend with `invoke('command_name', { args })`

## Important Files

### Configuration
- `tauri.conf.json` - Tauri app configuration
- `vite.config.ts` - Vite bundler config
- `tsconfig.json` - TypeScript config
- `Cargo.toml` - Rust dependencies

### Documentation
- `docs/refact/` - 21 detailed specification files
- `README.md` - Project overview
- `NEXT_STEPS.md` - Remaining work
- `PROJECT_STATUS_FINAL.md` - Complete status

### Environment
- `.env` - Local environment variables (gitignored)
- `.env.example` - Template for environment setup

## Environment Variables

```bash
# Supabase (optional, defaults to local)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=your-anon-key

# Discord (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

## Troubleshooting

### Rust Build Fails
```bash
cd src-tauri
cargo clean
cargo build
```

### Theme Not Applying
- Check theme files exist in `src-tauri/themes/`
- Verify `include_str!` paths in `theme_manager.rs`
- Rebuild: `npm run tauri:build`

### Frontend Issues
```bash
rm -rf node_modules dist
npm clean-install
npm run build
```

## Testing Strategy

### Unit Tests
- Test services in isolation
- Mock external APIs
- Use Vitest for TypeScript
- Use `cargo test` for Rust

### E2E Tests
- Use Playwright for UI testing
- Test main user flows
- Test on macOS (primary platform)

## Deployment

### Desktop App
- Build: `npm run tauri:build`
- Output: `src-tauri/target/release/bundle/`
- Platforms: macOS (primary), Windows, Linux

### Web Dashboard
- Deploy to Vercel
- Environment variables in Vercel dashboard
- Auto-deploy on push to main

## Best Practices

1. **Always run type check** before committing
2. **Test theme generation** after modifying colors
3. **Check Rust compilation** after backend changes
4. **Update documentation** when adding features
5. **Use semantic commit messages** (feat:, fix:, docs:)

## Current Status

**Completion**: 95% (Kiro integration added!)
**Build**: ✅ Passing
**Tests**: 🟡 In progress

### Recently Completed
- ✅ All 42 theme files
- ✅ Rust backend complete
- ✅ Multi-language support
- ✅ Kiro hooks (3 files)
- ✅ MCP servers (2 files)
- ✅ MCP configuration

### Remaining Work
- Basic testing setup
- Advanced features (log management, always on top)
- Web dashboard Supabase integration

## Resources

- **Tauri Docs**: https://tauri.app/
- **Open-Meteo API**: https://open-meteo.com/
- **Supabase Docs**: https://supabase.com/docs
- **Kiro MCP Guide**: Check Kiro documentation

---

When working on this project, prioritize:
1. Type safety (TypeScript strict mode)
2. Error handling (graceful degradation)
3. Platform compatibility (macOS primary)
4. Documentation (keep docs updated)
5. Testing (add tests for new features)

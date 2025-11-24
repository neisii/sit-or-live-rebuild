# 05_DEPENDENCIES

## Purpose

This document lists ALL project dependencies with EXACT versions (no ranges), their purpose, and installation verification. This ensures deterministic, reproducible builds.

## Prerequisites

- Node.js 20.11.0 installed
- Rust 1.77.2 installed
- npm 10.2.4 or later

## Desktop App Dependencies

### Production Dependencies

```json
{
  "@tauri-apps/plugin-dialog": "2.4.2",
  "@tauri-apps/plugin-log": "2.7.1",
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```

**Purpose**:
- `@tauri-apps/plugin-dialog`: File dialogs for log export
- `@tauri-apps/plugin-log`: Backend logging to files
- `react`: UI framework
- `react-dom`: React DOM renderer

### Development Dependencies

```json
{
  "@tauri-apps/api": "2.1.1",
  "@tauri-apps/cli": "2.1.0",
  "@types/react": "18.3.12",
  "@types/react-dom": "18.3.1",
  "@vitejs/plugin-react": "4.3.3",
  "@vitest/ui": "4.0.10",
  "cross-env": "10.1.0",
  "jsdom": "27.2.0",
  "typescript": "5.6.3",
  "vite": "5.4.10",
  "vitest": "4.0.10"
}
```

**Purpose**:
- `@tauri-apps/api`: Tauri JavaScript API
- `@tauri-apps/cli`: Tauri build tool
- `@types/*`: TypeScript type definitions
- `@vitejs/plugin-react`: Vite React plugin
- `@vitest/ui`: Test UI
- `cross-env`: Cross-platform environment variables
- `jsdom`: DOM testing environment
- `typescript`: TypeScript compiler
- `vite`: Build tool and dev server
- `vitest`: Test framework

### Rust Dependencies (Cargo.toml)

```toml
[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
log = "0.4"
tauri = { version = "2.9.2", features = [] }
tauri-plugin-log = "2.0"
tauri-plugin-shell = "2.0"
tauri-plugin-dialog = "2.0"
reqwest = { version = "0.11", features = ["json"] }
tokio = { version = "1", features = ["full"] }
chrono = "0.4"
dotenv = "0.15"

[build-dependencies]
tauri-build = { version = "2.5.1", features = [] }
```

**Purpose**:
- `serde_json`, `serde`: JSON serialization
- `log`: Logging framework
- `tauri`: Core framework
- `tauri-plugin-*`: Tauri plugins
- `reqwest`: HTTP client (for Supabase, Discord)
- `tokio`: Async runtime
- `chrono`: Date/time handling
- `dotenv`: Environment variable loading
- `tauri-build`: Build-time code generation

## Web Dashboard Dependencies

### Production Dependencies

```json
{
  "@supabase/supabase-js": "2.45.4",
  "leaflet": "1.9.4",
  "next": "14.2.15",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-leaflet": "4.2.1",
  "recharts": "2.12.7"
}
```

**Purpose**:
- `@supabase/supabase-js`: Supabase client
- `leaflet`: Map library
- `next`: Next.js framework
- `react`, `react-dom`: UI framework
- `react-leaflet`: React wrapper for Leaflet
- `recharts`: Chart library

### Development Dependencies

```json
{
  "@playwright/test": "1.56.1",
  "@types/leaflet": "1.9.12",
  "@types/node": "20",
  "@types/react": "18",
  "@types/react-dom": "18",
  "autoprefixer": "10.0.1",
  "eslint": "8",
  "eslint-config-next": "14.2.15",
  "postcss": "8",
  "tailwindcss": "3.4.1",
  "typescript": "5"
}
```

**Purpose**:
- `@playwright/test`: E2E testing
- `@types/*`: TypeScript types
- `autoprefixer`: CSS vendor prefixes
- `eslint`: Linting
- `postcss`: CSS processing
- `tailwindcss`: CSS framework
- `typescript`: TypeScript compiler

## Installation Steps

### Desktop App

```bash
# Navigate to project root
cd sit-or-live

# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0

# Expected output:
# sit-or-live@0.1.0
# ├── @tauri-apps/plugin-dialog@2.4.2
# ├── @tauri-apps/plugin-log@2.7.1
# ├── react@18.3.1
# └── react-dom@18.3.1
# (plus dev dependencies)

# Install Rust dependencies (automatic during build)
cargo check

# Expected output:
# Checking app v0.1.0 (/path/to/sit-or-live/src-tauri)
# Finished dev [unoptimized + debuginfo] target(s) in X.XXs
```

### Web Dashboard

```bash
# Navigate to web dashboard
cd web-dashboard

# Install dependencies
npm install

# Verify installation
npm list --depth=0

# Expected output:
# sit-or-live-dashboard@0.1.0
# ├── @supabase/supabase-js@2.45.4
# ├── leaflet@1.9.4
# ├── next@14.2.15
# ├── react@18.3.1
# ├── react-dom@18.3.1
# ├── react-leaflet@4.2.1
# └── recharts@2.12.7
# (plus dev dependencies)
```

## Verification

### Desktop App

```bash
# Check TypeScript compilation
npm run build

# Expected: No errors, dist/ folder created

# Check Rust compilation
cd src-tauri
cargo build

# Expected: target/debug/sit-or-live binary created

# Run tests
cd ..
npm test

# Expected: All tests pass
```

### Web Dashboard

```bash
cd web-dashboard

# Check TypeScript compilation
npm run build

# Expected: .next/ folder created, no errors

# Run linter
npm run lint

# Expected: No errors

# Run tests
npm test

# Expected: All Playwright tests pass
```

## Troubleshooting

### Issue: npm install fails with EACCES

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue: Cargo build fails with "linker not found"

**Solution** (macOS):
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Solution** (Linux):
```bash
# Install build essentials
sudo apt-get install build-essential
```

### Issue: Tauri CLI not found

**Solution**:
```bash
# Install globally
npm install -g @tauri-apps/cli@2.1.0

# Or use npx
npx tauri --version
```

### Issue: Version mismatch

**Solution**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall with exact versions
npm install

# For Rust, delete Cargo.lock
rm Cargo.lock
cargo build
```

## Dependency Update Policy

**DO NOT UPDATE** dependencies without:
1. Testing all features
2. Updating this document
3. Verifying cross-platform compatibility
4. Updating lock files (package-lock.json, Cargo.lock)

**Security Updates**:
- Check for vulnerabilities: `npm audit`
- Update only if critical: `npm update <package>@<exact-version>`
- Test thoroughly before committing

## Next Steps

Proceed to `06_CONFIGURATION.md` to set up all configuration files.

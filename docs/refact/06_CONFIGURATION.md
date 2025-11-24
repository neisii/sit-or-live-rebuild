# 06_CONFIGURATION

## Purpose

This document contains ALL configuration files with complete content. No placeholders, no "refer to X" - everything is here, copy-paste ready.

## Prerequisites

- Dependencies installed (see `05_DEPENDENCIES.md`)
- Project structure created

## Configuration Files

### 1. package.json (Desktop App)

**Location**: `sit-or-live/package.json`

```json
{
  "name": "sit-or-live",
  "version": "0.1.0",
  "description": "Weather-based theme changer + Developer health manager",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "cross-env VITE_TIMER_MODE=rust tauri dev",
    "tauri:dev:rust": "cross-env VITE_TIMER_MODE=rust tauri dev",
    "tauri:dev:js": "cross-env VITE_TIMER_MODE=javascript tauri dev",
    "tauri:build": "cross-env VITE_TIMER_MODE=rust tauri build",
    "tauri:build:rust": "cross-env VITE_TIMER_MODE=rust tauri build",
    "tauri:build:js": "cross-env VITE_TIMER_MODE=javascript tauri build",
    "generate-themes": "node scripts/generate-theme-presets.cjs",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "@tauri-apps/plugin-dialog": "^2.4.2",
    "@tauri-apps/plugin-log": "^2.7.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tauri-apps/api": "^2.1.1",
    "@tauri-apps/cli": "^2.1.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "@vitest/ui": "^4.0.10",
    "cross-env": "^10.1.0",
    "jsdom": "^27.2.0",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^4.0.10"
  }
}
```

### 2. tsconfig.json (Desktop App)

**Location**: `sit-or-live/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. tsconfig.node.json (Desktop App)

**Location**: `sit-or-live/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 4. vite.config.ts (Desktop App)

**Location**: `sit-or-live/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### 5. Cargo.toml (Rust Backend)

**Location**: `sit-or-live/src-tauri/Cargo.toml`

```toml
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
license = ""
repository = ""
edition = "2021"
rust-version = "1.77.2"

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.5.1", features = [] }

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
```

### 6. tauri.conf.json (Tauri Configuration)

**Location**: `sit-or-live/src-tauri/tauri.conf.json`

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "sit-or-live",
  "version": "0.1.0",
  "identifier": "com.neisii.sit-or-live",
  "build": {
    "frontendDist": "../dist",
    "devUrl": "http://localhost:1420",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "app": {
    "windows": [
      {
        "title": "sit-or-live",
        "width": 320,
        "height": 1000,
        "resizable": true,
        "fullscreen": false,
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    ],
    "security": {
      "csp": null
    },
    "withGlobalTauri": true
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

### 7. .env (Environment Variables)

**⚠️ CRITICAL SECURITY WARNING**: This file contains secrets and MUST NEVER be committed to Git!

**Location**: `sit-or-live/.env`

**DO NOT CREATE THIS FILE YET!** First, create `.env.example`:

**Step 1: Create .env.example (Safe to commit)**:
```bash
cat > .env.example << 'EOF'
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# For local development, use:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
```

**Step 2: Create .env from example (NOT committed)**:
```bash
# Copy example to create actual .env
cp .env.example .env

# Edit with real values (use your editor)
# NEVER commit this file!
```

**Step 3: Verify .env is ignored**:
```bash
# Check .env is in .gitignore
grep "^\.env$" .gitignore
# Expected: .env

# Verify Git ignores it
git check-ignore .env
# Expected: .env (means it's ignored)

# Try to stage it (should fail)
git add .env 2>&1 | grep "ignored" || echo "⚠️  WARNING: .env is NOT ignored!"
```

**For Local Development**:
```bash
# Use local Supabase
cat > .env << 'EOF'
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
```

**For Production** (see `18_DEPLOYMENT.md` for secure setup):
- Store in GitHub Secrets
- Store in Vercel Environment Variables
- NEVER in .env files committed to Git

### 8. package.json (Web Dashboard)

**Location**: `sit-or-live/web-dashboard/package.json`

```json
{
  "name": "sit-or-live-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:chromium": "playwright test --project=chromium",
    "test:demo": "playwright test -g 'Demo Generation'",
    "test:report": "playwright show-report"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "leaflet": "^1.9.4",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-leaflet": "^4.2.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.1",
    "@types/leaflet": "^1.9.12",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.15",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

### 9. next.config.js (Web Dashboard)

**Location**: `sit-or-live/web-dashboard/next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

### 10. tailwind.config.ts (Web Dashboard)

**Location**: `sit-or-live/web-dashboard/tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
```

### 11. playwright.config.ts (Web Dashboard)

**Location**: `sit-or-live/web-dashboard/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 12. .env.local (Web Dashboard)

**⚠️ CRITICAL SECURITY WARNING**: This file contains secrets and MUST NEVER be committed!

**Location**: `sit-or-live/web-dashboard/.env.local`

**Step 1: Create .env.example (Safe to commit)**:
```bash
cd web-dashboard

cat > .env.example << 'EOF'
# Supabase Configuration (Public - safe for client-side)
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For local development:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

**Step 2: Create .env.local from example (NOT committed)**:
```bash
# Copy example
cp .env.example .env.local

# Edit with real values
# For local development, use local Supabase values
# For production, use Vercel Environment Variables (see 18_DEPLOYMENT.md)
```

**Step 3: Verify it's ignored**:
```bash
# Check .gitignore
grep "\.env\.local" ../.gitignore
# Expected: .env.local

# Verify Git ignores it
git check-ignore .env.local
# Expected: .env.local

# Verify .env.example CAN be committed
git add .env.example
git status
# Expected: .env.example staged (this is correct)
```

### 13. vercel.json (Web Dashboard Deployment)

**Location**: `sit-or-live/web-dashboard/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### 14. .gitignore

**Location**: `sit-or-live/.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/
test-results/
playwright-report/
screenshots/

# Production
dist/
build/
.next/
out/

# Environment
.env
.env.local
.env.production
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Rust
target/
Cargo.lock

# Tauri
src-tauri/target/
src-tauri/WixTools/

# Supabase
.vercel/
supabase/.branches/
supabase/.temp/
```

## Verification

### Desktop App

```bash
# Verify all config files exist
ls -la package.json tsconfig.json vite.config.ts
ls -la src-tauri/Cargo.toml src-tauri/tauri.conf.json

# Test configuration
npm run build
# Expected: No errors

cargo check
# Expected: No errors
```

### Web Dashboard

```bash
cd web-dashboard

# Verify config files
ls -la package.json next.config.js tailwind.config.ts playwright.config.ts

# Test configuration
npm run build
# Expected: .next/ folder created

npm run lint
# Expected: No errors
```

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Verify all paths in tsconfig.json are correct

### Issue: Tauri build fails

**Solution**: Check tauri.conf.json paths match your project structure

### Issue: Environment variables not loaded

**Solution**: 
1. Verify .env file exists
2. Restart dev server
3. Check variable names match exactly

## Next Steps

Proceed to `07_DATABASE_SCHEMA.md` to set up the Supabase database.

# 18_DEPLOYMENT

## Purpose

Complete production deployment guide for desktop app (Tauri) and web dashboard (Vercel), including Supabase Cloud setup and CI/CD pipelines.

## Prerequisites

- GitHub account
- Vercel account
- Supabase Cloud account
- Code signing certificates (for macOS/Windows)

## Deployment Architecture

```
Production Stack:
├── Desktop App → GitHub Releases (macOS, Windows, Linux)
├── Web Dashboard → Vercel (https://sit-or-live.vercel.app)
└── Database → Supabase Cloud (PostgreSQL + Realtime)
```

## 1. Supabase Cloud Setup

### Create Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - Name: `sit-or-live`
   - Database Password: (generate strong password)
   - Region: Choose closest to users
4. Wait for project creation (~2 minutes)

### Apply Migrations

```bash
# Link to cloud project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Expected output:
# Applying migration 20251121101852_create_tables.sql...
# Applying migration 20251121105100_create_upsert_functions.sql...
# Finished supabase db push.
```

### Enable Realtime

1. Go to Database → Replication
2. Enable replication for:
   - `theme_usage`
   - `activity_heatmap`
3. Click "Save"

### Get Credentials

1. Go to Settings → API
2. Copy:
   - Project URL: `https://your-project.supabase.co`
   - Anon/Public Key: `eyJhbGc...`
3. Save for later use

### Verification

```bash
# Test connection
curl "https://your-project.supabase.co/rest/v1/theme_usage?select=*" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"

# Expected: JSON array of theme usage data
```

## 2. Desktop App Deployment

### Build for Production

```bash
# macOS
npm run tauri:build

# Output: src-tauri/target/release/bundle/
# - dmg: sit-or-live_0.1.0_x64.dmg
# - app: sit-or-live.app

# Windows (on Windows machine)
npm run tauri:build

# Output: src-tauri/target/release/bundle/
# - msi: sit-or-live_0.1.0_x64_en-US.msi
# - exe: sit-or-live.exe

# Linux
npm run tauri:build

# Output: src-tauri/target/release/bundle/
# - deb: sit-or-live_0.1.0_amd64.deb
# - appimage: sit-or-live_0.1.0_amd64.AppImage
```

### Code Signing (macOS)

```bash
# 1. Get Apple Developer certificate
# 2. Import to Keychain
# 3. Sign app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Your Name" \
  src-tauri/target/release/bundle/macos/sit-or-live.app

# 4. Notarize (required for macOS 10.15+)
xcrun notarytool submit \
  src-tauri/target/release/bundle/dmg/sit-or-live_0.1.0_x64.dmg \
  --apple-id your@email.com \
  --team-id TEAM_ID \
  --password app-specific-password \
  --wait

# 5. Staple notarization
xcrun stapler staple \
  src-tauri/target/release/bundle/dmg/sit-or-live_0.1.0_x64.dmg
```

### GitHub Release

```bash
# 1. Create tag
git tag v0.1.0
git push origin v0.1.0

# 2. Create release on GitHub
# Go to Releases → New Release
# - Tag: v0.1.0
# - Title: "Sit or Live v0.1.0"
# - Description: Release notes
# - Upload binaries:
#   - sit-or-live_0.1.0_x64.dmg (macOS)
#   - sit-or-live_0.1.0_x64_en-US.msi (Windows)
#   - sit-or-live_0.1.0_amd64.deb (Linux)
#   - sit-or-live_0.1.0_amd64.AppImage (Linux)

# 3. Publish release
```

### Auto-Update Configuration

**File**: `src-tauri/tauri.conf.json`

```json
{
  "updater": {
    "active": true,
    "endpoints": [
      "https://github.com/neisii/sit-or-live/releases/latest/download/latest.json"
    ],
    "dialog": true,
    "pubkey": "your-public-key"
  }
}
```

## 3. Web Dashboard Deployment (Vercel)

### Prepare for Deployment

```bash
cd web-dashboard

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# Test production build
npm run build

# Expected: .next/ folder created, no errors
```

### Deploy to Vercel

**Option 1: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Project name: sit-or-live-dashboard
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
# - Install command: npm install

# Expected output:
# ✅ Production: https://sit-or-live.vercel.app
```

**Option 2: Vercel Dashboard**

1. Go to https://vercel.com/new
2. Import Git Repository
3. Select `sit-or-live` repo
4. Configure:
   - Root Directory: `web-dashboard`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Verification

```bash
# Test production deployment
curl https://sit-or-live.vercel.app

# Expected: HTML response with "Sit or Live"

# Test API
curl https://sit-or-live.vercel.app/api/health

# Check Lighthouse score
npx lighthouse https://sit-or-live.vercel.app --view

# Expected: Performance > 90
```

## 4. CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    tags:
      - 'v*'

jobs:
  build-desktop:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build desktop app
        run: npm run tauri:build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: desktop-${{ matrix.os }}
          path: src-tauri/target/release/bundle/

  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        run: |
          cd web-dashboard
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

  create-release:
    needs: [build-desktop]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            desktop-macos-latest/**/*.dmg
            desktop-windows-latest/**/*.msi
            desktop-ubuntu-latest/**/*.deb
            desktop-ubuntu-latest/**/*.AppImage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Required Secrets

**⚠️ CRITICAL: Secrets Management**

**NEVER commit secrets to Git!** Use platform-specific secret storage:

#### GitHub Secrets (for CI/CD)

**Add to**: Repository → Settings → Secrets and variables → Actions

```bash
# Navigate to GitHub repository settings
# Settings → Secrets and variables → Actions → New repository secret

# Add these secrets:
Name: SUPABASE_URL
Value: https://your-project.supabase.co

Name: SUPABASE_ANON_KEY
Value: eyJhbGc... (your actual key)

Name: VERCEL_TOKEN
Value: (get from Vercel → Settings → Tokens)
```

**Verification**:
```bash
# Secrets should appear in GitHub UI but values are hidden
# Go to: Settings → Secrets and variables → Actions
# Expected: 3 secrets listed (SUPABASE_URL, SUPABASE_ANON_KEY, VERCEL_TOKEN)
```

#### Vercel Environment Variables (for Web Dashboard)

**Add to**: Vercel Dashboard → Project → Settings → Environment Variables

```bash
# Go to: https://vercel.com/your-username/sit-or-live/settings/environment-variables

# Add these variables:
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
Environments: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... (your actual key)
Environments: Production, Preview, Development
```

**Verification**:
```bash
# Check Vercel dashboard shows 2 environment variables
# Values should be hidden (••••••••)
```

#### Local Development Secrets

**Create .env files locally (NOT committed)**:

```bash
# Root .env (for desktop app)
cat > .env << 'EOF'
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

# Web dashboard .env.local
cat > web-dashboard/.env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

# Verify they're ignored
git check-ignore .env web-dashboard/.env.local
# Expected: Both files listed (means ignored)
```

#### Secret Rotation Procedure

**When to rotate secrets**:
- Suspected compromise
- Team member leaves
- Every 90 days (best practice)
- After public repository exposure

**How to rotate**:
```bash
# 1. Generate new Supabase key
# Supabase Dashboard → Settings → API → Reset anon key

# 2. Update GitHub Secrets
# Settings → Secrets → SUPABASE_ANON_KEY → Update

# 3. Update Vercel Environment Variables
# Vercel → Settings → Environment Variables → Edit

# 4. Update local .env files
# Edit .env and web-dashboard/.env.local

# 5. Redeploy
vercel --prod

# 6. Verify old key no longer works
curl "https://your-project.supabase.co/rest/v1/theme_usage" \
  -H "apikey: old-key"
# Expected: 401 Unauthorized
```

#### Files Containing Secrets (NEVER COMMIT)

**Checklist of secret-containing files**:
```
❌ .env
❌ .env.local
❌ .env.production
❌ .env.development
❌ web-dashboard/.env
❌ web-dashboard/.env.local
❌ web-dashboard/.env.production
❌ .kiro/settings/mcp.json (contains Discord webhook)
❌ *.key, *.pem, *.p12 (certificates)
❌ secrets/ directory
```

**Safe to commit**:
```
✅ .env.example
✅ web-dashboard/.env.example
✅ .gitignore
✅ Documentation mentioning placeholder values
```

**Verification before ANY commit**:
```bash
# Check for secrets in staged files
git diff --cached | grep -i "supabase_anon_key\|discord_webhook\|password\|secret" || echo "✅ No secrets found"

# Verify .env files are ignored
git status | grep "\.env" && echo "❌ ERROR: .env file not ignored!" || echo "✅ .env files ignored"

# Run pre-commit hook manually
.husky/pre-commit
# Expected: ✅ Pre-commit checks passed
```

## 5. Environment Variables

### Desktop App (.env)

```bash
# Production Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Web Dashboard (.env.production)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 6. Domain Configuration

### Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add domain: `sit-or-live.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (~24 hours)
5. Verify: https://sit-or-live.com

## 7. Monitoring & Analytics

### Vercel Analytics

```typescript
// web-dashboard/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Supabase Monitoring

1. Go to Supabase Dashboard → Reports
2. Monitor:
   - API requests
   - Database connections
   - Realtime connections
   - Storage usage

### Error Tracking (Sentry)

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure
npx @sentry/wizard -i nextjs
```

## 8. Post-Deployment Checklist

```markdown
## Desktop App
- [ ] Builds successfully on all platforms
- [ ] Code signed (macOS/Windows)
- [ ] Notarized (macOS)
- [ ] GitHub release created
- [ ] Download links work
- [ ] Auto-update configured
- [ ] Connects to production Supabase

## Web Dashboard
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Lighthouse score > 90
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Analytics configured

## Database
- [ ] Migrations applied
- [ ] Realtime enabled
- [ ] RLS policies active
- [ ] Sample data removed
- [ ] Backups configured
- [ ] Monitoring enabled

## CI/CD
- [ ] GitHub Actions workflow active
- [ ] Secrets configured
- [ ] Auto-deploy on tag push
- [ ] Tests pass in CI
- [ ] Artifacts uploaded
```

## 9. Rollback Procedure

### Desktop App

```bash
# 1. Delete problematic release
# GitHub → Releases → Delete release

# 2. Users can download previous version
# GitHub → Releases → Previous version

# 3. Fix issue and redeploy
git revert <commit>
git tag v0.1.1
git push origin v0.1.1
```

### Web Dashboard

```bash
# Vercel automatic rollback
vercel rollback

# Or via dashboard:
# Vercel → Deployments → Previous deployment → Promote to Production
```

### Database

```bash
# Rollback migration
supabase db reset --db-url "postgresql://..."

# Or restore from backup
# Supabase Dashboard → Database → Backups → Restore
```

## Verification

```bash
# Test desktop app download
curl -L https://github.com/neisii/sit-or-live/releases/latest/download/sit-or-live_0.1.0_x64.dmg -o test.dmg

# Test web dashboard
curl https://sit-or-live.vercel.app

# Test Supabase connection
curl "https://your-project.supabase.co/rest/v1/theme_usage?select=*" \
  -H "apikey: your-anon-key"

# All should return 200 OK
```

## Troubleshooting

### Issue: Build fails on CI

**Solution**:
1. Check Node.js version matches local
2. Verify all secrets are set
3. Check build logs for specific errors
4. Test build locally first

### Issue: Vercel deployment fails

**Solution**:
1. Check build command is correct
2. Verify environment variables
3. Check Next.js version compatibility
4. Review Vercel logs

### Issue: Supabase connection fails

**Solution**:
1. Verify URL and key are correct
2. Check RLS policies allow access
3. Test with curl command
4. Check Supabase status page

## Next Steps

Proceed to `19_DOCUMENTATION.md` for user-facing documentation.

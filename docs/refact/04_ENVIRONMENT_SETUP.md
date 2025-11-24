# 04_ENVIRONMENT_SETUP

## Purpose
Complete development environment setup with exact commands and verification steps.

## Prerequisites
- Read `01_PROJECT_OVERVIEW.md`
- Read `02_TECHNICAL_ARCHITECTURE.md`
- Read `03_DESIGN_DECISIONS.md`

---

## System Requirements

### Minimum Requirements
- **OS**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB (8GB recommended)
- **Disk**: 2GB free space
- **Internet**: Required for initial setup

### Supported Platforms
- ✅ macOS (Intel + Apple Silicon)
- ✅ Windows 10/11
- ✅ Linux (Debian-based, Arch, Fedora)

---

## Phase 1: Core Tools Installation

### 1.1 Node.js (v18.x or v20.x)

**macOS/Linux**:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Windows**:
```powershell
# Download from nodejs.org
# Install Node.js 20.x LTS
# Verify in PowerShell:
node --version
npm --version
```

**Verification**:
```bash
node --version  # v20.11.0 or higher
npm --version   # 10.2.4 or higher
```

### 1.2 Rust (1.70+)

**All Platforms**:
```bash
# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Follow prompts (default installation)
# Restart terminal

# Verify
rustc --version  # Should show 1.70.0 or higher
cargo --version  # Should show 1.70.0 or higher
```

**Verification**:
```bash
rustc --version  # rustc 1.75.0 or higher
cargo --version  # cargo 1.75.0 or higher
```

### 1.3 Git (2.30+)

**macOS**:
```bash
# Git comes with Xcode Command Line Tools
git --version

# If not installed:
brew install git
```

**Linux**:
```bash
sudo apt install git  # Ubuntu/Debian
sudo dnf install git  # Fedora
sudo pacman -S git    # Arch
```

**Windows**:
```powershell
# Download from git-scm.com
# Or use winget:
winget install Git.Git
```

**Configure Git**:
```bash
# Set user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set editor (optional)
git config --global core.editor "code --wait"  # VS Code
# or
git config --global core.editor "vim"  # Vim

# Verify
git config --list
```

**Verification**:
```bash
git --version  # 2.30.0 or higher
git config user.name  # Should show your name
git config user.email  # Should show your email
```

### 1.4 Platform-Specific Dependencies

**macOS**:
```bash
# Xcode Command Line Tools
xcode-select --install

# Verify
xcode-select -p  # Should show /Library/Developer/CommandLineTools
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  patchelf

# Verify
dpkg -l | grep libwebkit2gtk-4.1-dev
```

**Linux (Fedora)**:
```bash
sudo dnf install \
  webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel

# Verify
rpm -qa | grep webkit2gtk
```

**Windows**:
```powershell
# Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"

# Install WebView2 (usually pre-installed on Windows 10/11)
# If needed, download from: https://developer.microsoft.com/microsoft-edge/webview2/
```

---

## Phase 2: Project Setup

### 2.1 Clone Repository

```bash
# Create project directory
mkdir -p ~/projects
cd ~/projects

# Clone (or create new project)
git clone https://github.com/yourusername/sit-or-live.git
cd sit-or-live

# Or initialize new project
mkdir sit-or-live
cd sit-or-live
git init
```

### 2.2 Install Dependencies

**Desktop App**:
```bash
# Install Node dependencies
npm install

# Expected output:
# added 150+ packages in ~30s

# Verify
ls node_modules | wc -l  # Should show 150+
```

**Rust Dependencies** (auto-installed on first build):
```bash
cd src-tauri
cargo fetch

# Expected output:
# Downloading crates...
# Downloaded 50+ crates

# Verify
ls ~/.cargo/registry/cache  # Should show downloaded crates
cd ..
```

**Web Dashboard**:
```bash
cd web-dashboard
npm install

# Expected output:
# added 150+ packages in ~30s

# Verify
ls node_modules | wc -l  # Should show 150+
cd ..
```

### 2.3 Environment Variables

**Desktop App** (`.env` in root):
```bash
# Create .env file
cat > .env << 'EOF'
# Supabase Configuration (Local Development)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Timer Mode (rust or javascript)
VITE_TIMER_MODE=rust

# Discord Webhook (Optional)
DISCORD_WEBHOOK_URL=
EOF

# Verify
cat .env
```

**Web Dashboard** (`web-dashboard/.env.local`):
```bash
cd web-dashboard
cat > .env.local << 'EOF'
# Local Supabase (for E2E testing)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF

# Verify
cat .env.local
cd ..
```

**Production** (`web-dashboard/.env.production`):
```bash
cd web-dashboard
cat > .env.production << 'EOF'
# Supabase Cloud (Production)
# Replace with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF
cd ..
```

---

## Phase 3: Database Setup (Supabase Local)

### 3.1 Install Supabase CLI

**macOS/Linux**:
```bash
# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase

# Verify
supabase --version  # Should show v1.x.x
```

**Windows**:
```powershell
# Using Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase

# Verify
supabase --version
```

### 3.2 Start Local Supabase

```bash
# Initialize Supabase (if not already done)
supabase init

# Start local Supabase
supabase start

# Expected output:
# Started supabase local development setup.
#
#          API URL: http://127.0.0.1:54321
#      Database URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
#        Studio URL: http://127.0.0.1:54323

# Verify
curl http://127.0.0.1:54321/rest/v1/  # Should return API info
```

### 3.3 Apply Database Schema

```bash
# Create migration file
supabase migration new initial_schema

# Copy schema from docs/refact/07_DATABASE_SCHEMA.md
# (Will be created in next document)

# Apply migration
supabase db reset

# Verify
supabase db diff  # Should show no changes
```

---

## Phase 4: IDE Setup (Optional but Recommended)

### 4.1 VS Code Extensions

```bash
# Install VS Code extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension rust-lang.rust-analyzer
code --install-extension tauri-apps.tauri-vscode

# Verify
code --list-extensions | grep -E "eslint|prettier|tailwind|rust|tauri"
```

### 4.2 VS Code Settings

```bash
# Create .vscode/settings.json
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
EOF
```

---

## Phase 5: Verification

### 5.1 Build Desktop App

```bash
# Development build
npm run tauri:dev

# Expected output:
# Running BeforeDevCommand (`npm run dev`)
# VITE v5.4.21  ready in 109 ms
# Running DevCommand (`cargo run`)
# Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.50s
# [INFO] Sit or Live app started

# App should open in a window
# Verify: Window opens, no errors in console
```

### 5.2 Build Web Dashboard

```bash
cd web-dashboard
npm run dev

# Expected output:
# ▲ Next.js 14.2.15
# - Local:        http://localhost:3000
# ✓ Ready in 1093ms

# Open browser: http://localhost:3000
# Verify: Dashboard loads, no errors
cd ..
```

### 5.3 Run Tests

```bash
# Frontend tests (if any)
npm test

# Rust tests
cd src-tauri
cargo test
cd ..

# E2E tests (after implementation)
cd web-dashboard
npm run test:e2e
cd ..
```

### 5.4 Check Linting

```bash
# TypeScript/ESLint
npm run lint

# Expected output:
# ✓ No ESLint warnings or errors

# Rust clippy
cd src-tauri
cargo clippy
# Expected output:
# Finished dev [unoptimized + debuginfo] target(s)
cd ..
```

---

## Phase 6: Troubleshooting

### Issue: Node.js version mismatch

**Symptom**: `npm install` fails with version error

**Solution**:
```bash
nvm install 20
nvm use 20
rm -rf node_modules package-lock.json
npm install
```

### Issue: Rust compilation fails

**Symptom**: `cargo build` fails with linker errors

**Solution (macOS)**:
```bash
xcode-select --install
rustup update
```

**Solution (Linux)**:
```bash
sudo apt install build-essential
rustup update
```

### Issue: Supabase won't start

**Symptom**: `supabase start` fails with Docker error

**Solution**:
```bash
# Install Docker Desktop
# macOS: brew install --cask docker
# Linux: sudo apt install docker.io
# Windows: Download from docker.com

# Start Docker
# Retry supabase start
supabase stop
supabase start
```

### Issue: Port already in use

**Symptom**: `npm run dev` fails with EADDRINUSE

**Solution**:
```bash
# Find process using port
lsof -i :1420  # or :3000 for web dashboard

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

---

## Verification Checklist

Before proceeding, verify:
- [ ] Node.js 20.x installed and working
- [ ] Rust 1.70+ installed and working
- [ ] Platform dependencies installed
- [ ] Project dependencies installed (npm install)
- [ ] Environment variables configured (.env files)
- [ ] Supabase local running (http://127.0.0.1:54321)
- [ ] Desktop app builds and runs (npm run tauri:dev)
- [ ] Web dashboard builds and runs (npm run dev)
- [ ] No linting errors (npm run lint)
- [ ] No compilation errors (cargo clippy)

## Phase 6: Git Repository Initialization

### 6.1 Initialize Repository

```bash
# Navigate to project root
cd sit-or-live

# Initialize Git
git init

# Set default branch
git branch -M main

# Verify
git status
# Expected: On branch main, No commits yet
```

### 6.2 Create .gitignore

**File**: `.gitignore`

```bash
cat > .gitignore << 'EOF'
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

# Environment Variables (CRITICAL - NEVER COMMIT)
.env
.env.local
.env.production
.env.development
.env.*.local
web-dashboard/.env
web-dashboard/.env.local
web-dashboard/.env.production

# Secrets (CRITICAL - NEVER COMMIT)
*.key
*.pem
*.p12
*.pfx
secrets/
.secrets/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/

# Rust
target/
Cargo.lock
**/*.rs.bk

# Tauri
src-tauri/target/
src-tauri/WixTools/
src-tauri/gen/

# Supabase
.vercel/
supabase/.branches/
supabase/.temp/

# Temporary
.tmp/
.temp/
*.tmp
*.temp
EOF
```

**Verification**:
```bash
# Check .gitignore exists
cat .gitignore | head -n 5

# Test ignore rules
echo "test" > .env
git status
# Expected: .env should NOT appear in untracked files

# Clean up test
rm .env
```

### 6.3 Install Pre-commit Hooks

**Install Husky**:
```bash
# Install as dev dependency
npm install --save-dev husky

# Initialize husky
npx husky install

# Add install script to package.json
npm pkg set scripts.prepare="husky install"
```

**Create Pre-commit Hook**:
```bash
# Create .husky directory if not exists
mkdir -p .husky

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Check for secret files
SECRET_FILES=$(git diff --cached --name-only | grep -E '\.(env|key|pem|p12|pfx)$' || true)
if [ -n "$SECRET_FILES" ]; then
  echo "❌ ERROR: Attempting to commit secret files!"
  echo "$SECRET_FILES"
  echo ""
  echo "These files should be in .gitignore"
  exit 1
fi

# Check for hardcoded secrets in staged files
HARDCODED_SECRETS=$(git diff --cached | grep -E '(SUPABASE_URL|SUPABASE_ANON_KEY|DISCORD_WEBHOOK|API_KEY|SECRET|PASSWORD|TOKEN).*=.*["\x27][a-zA-Z0-9_\-]{20,}["\x27]' || true)
if [ -n "$HARDCODED_SECRETS" ]; then
  echo "⚠️  WARNING: Possible hardcoded secrets detected!"
  echo "$HARDCODED_SECRETS"
  echo ""
  echo "Please use environment variables instead."
  echo "Example: process.env.SUPABASE_URL"
  exit 1
fi

# Check for .env files not in .gitignore
ENV_FILES=$(find . -name ".env*" -not -name "*.example" -not -path "*/node_modules/*" -not -path "*/.git/*" || true)
for file in $ENV_FILES; do
  if ! git check-ignore -q "$file"; then
    echo "❌ ERROR: $file is not in .gitignore!"
    echo "Add it to .gitignore immediately."
    exit 1
  fi
done

echo "✅ Pre-commit checks passed"
EOF

# Make executable
chmod +x .husky/pre-commit
```

**Verification**:
```bash
# Test pre-commit hook
echo "test" > .env
git add .env
git commit -m "test"
# Expected: Hook should BLOCK commit with error

# Clean up
git reset HEAD .env
rm .env

# Test with safe file
echo "test" > test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"
# Expected: Commit should succeed

# Clean up
git reset --soft HEAD~1
rm test.txt
```

### 6.4 Create .env.example Files

**Root .env.example**:
```bash
cat > .env.example << 'EOF'
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# For local development, use:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

**Web Dashboard .env.example**:
```bash
cat > web-dashboard/.env.example << 'EOF'
# Supabase Configuration (Public - safe for client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For local development:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF
```

**Verification**:
```bash
# Check .env.example files exist
ls -la .env.example web-dashboard/.env.example

# Verify they can be committed (not in .gitignore)
git add .env.example web-dashboard/.env.example
git status
# Expected: Both files should be staged

# Don't commit yet, just verify
git reset HEAD .env.example web-dashboard/.env.example
```

### 6.5 Initial Commit

```bash
# Stage initial files
git add .gitignore
git add .env.example web-dashboard/.env.example
git add package.json
git add README.md

# Create initial commit
git commit -m "chore: initial project setup with security measures

- Add comprehensive .gitignore
- Add .env.example files with placeholders
- Configure pre-commit hooks for secret detection
- Set up Husky for Git hooks"

# Verify
git log --oneline
# Expected: 1 commit shown
```

## Next Steps

**Read Next**: `05_DEPENDENCIES.md`

This will list all dependencies with exact versions and purposes.

---

**Version**: 1.0.0  
**Estimated Time**: 1 hour  
**Prerequisites**: 01, 02, 03  
**Next**: Dependencies

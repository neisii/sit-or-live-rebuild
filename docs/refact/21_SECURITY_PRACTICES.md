# 21_SECURITY_PRACTICES

## Purpose

Comprehensive security guide covering secrets management, Git security, and best practices to prevent credential leaks and security vulnerabilities.

## Prerequisites

- Git installed and configured
- Project repository initialized
- Understanding of environment variables

---

## 1. Secrets Management

### What Are Secrets?

**Secrets** are sensitive credentials that must NEVER be committed to Git:

- API keys (Supabase, Discord, OpenWeather, etc.)
- Database passwords
- Authentication tokens
- Private keys (.key, .pem, .p12 files)
- Webhook URLs
- OAuth client secrets
- Encryption keys

### Files That Contain Secrets (NEVER COMMIT)

```
❌ NEVER COMMIT THESE:
.env
.env.local
.env.production
.env.development
.env.*.local
web-dashboard/.env
web-dashboard/.env.local
web-dashboard/.env.production
*.key
*.pem
*.p12
*.pfx
secrets/
.secrets/
config/secrets.json
.kiro/settings/mcp.json (if contains webhooks)
```

### Files That Are Safe to Commit

```
✅ SAFE TO COMMIT:
.env.example
web-dashboard/.env.example
.gitignore
README.md (with placeholder examples)
Documentation (with placeholder values)
```

---

## 2. Git Configuration

### Initial Git Setup

```bash
# Configure user info
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch
git config --global init.defaultBranch main

# Set editor
git config --global core.editor "code --wait"

# Enable credential caching (optional)
git config --global credential.helper cache

# Verify configuration
git config --list
```

### Git Commit Strategy

**Commit after each major milestone:**

```bash
# Phase 0: Understanding
git add docs/_refact/01_*.md docs/_refact/02_*.md docs/_refact/03_*.md
git commit -m "docs: complete Phase 0 - Understanding"

# Phase 1: Environment Setup
git add .gitignore .env.example package.json
git commit -m "feat: complete Phase 1 - Environment setup"

# Phase 2: Core Implementation
git add src/ src-tauri/ themes/
git commit -m "feat: complete Phase 2 - Core implementation"

# Phase 3: Integration
git add .kiro/ web-dashboard/
git commit -m "feat: complete Phase 3 - Integration"

# Phase 4: Quality Assurance
git add tests/ playwright.config.ts
git commit -m "test: complete Phase 4 - Quality assurance"

# Phase 5: Finalization
git add README.md docs/
git commit -m "docs: complete Phase 5 - Finalization"
```

### Git Branching Strategy

**Use feature branches for each phase:**

```bash
# Initial setup
git init
git checkout -b main
git add .gitignore README.md
git commit -m "chore: initial commit"

# Phase 1: Environment
git checkout -b feature/phase-1-environment
# ... work on Phase 1 ...
git add .
git commit -m "feat: complete environment setup"
git checkout main
git merge feature/phase-1-environment --no-ff
git branch -d feature/phase-1-environment

# Phase 2: Core Implementation
git checkout -b feature/phase-2-core
# ... work on Phase 2 ...
git add .
git commit -m "feat: complete core implementation"
git checkout main
git merge feature/phase-2-core --no-ff
git branch -d feature/phase-2-core

# Phase 3: Integration
git checkout -b feature/phase-3-integration
# ... work on Phase 3 ...
git add .
git commit -m "feat: complete integration"
git checkout main
git merge feature/phase-3-integration --no-ff
git branch -d feature/phase-3-integration

# Phase 4: Quality
git checkout -b feature/phase-4-quality
# ... work on Phase 4 ...
git add .
git commit -m "test: complete quality assurance"
git checkout main
git merge feature/phase-4-quality --no-ff
git branch -d feature/phase-4-quality

# Phase 5: Finalization
git checkout -b feature/phase-5-finalization
# ... work on Phase 5 ...
git add .
git commit -m "docs: complete finalization"
git checkout main
git merge feature/phase-5-finalization --no-ff
git branch -d feature/phase-5-finalization
```

### Conventional Commit Messages

**Format**: `<type>(<scope>): <subject>`

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements
- `ci:` - CI/CD changes
- `build:` - Build system changes

**Examples**:
```bash
git commit -m "feat(weather): add Open-Meteo API integration"
git commit -m "fix(theme): correct color contrast in dark mode"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(dashboard): add E2E tests for real-time updates"
git commit -m "chore(deps): update dependencies to latest versions"
```

---

## 3. .gitignore Configuration

### Complete .gitignore

**File**: `.gitignore`

```gitignore
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
```

### Verify .gitignore

```bash
# Check .gitignore exists
cat .gitignore | head -n 5

# Test ignore rules
echo "test" > .env
git status
# Expected: .env should NOT appear in untracked files

# Verify specific files are ignored
git check-ignore .env .env.local .env.production
# Expected: All three files listed (means ignored)

# Clean up test
rm .env
```

---

## 4. Pre-commit Hooks

### Install Husky

```bash
# Install as dev dependency
npm install --save-dev husky

# Initialize husky
npx husky install

# Add install script to package.json
npm pkg set scripts.prepare="husky install"

# Verify
ls -la .husky/
# Expected: .husky/ directory exists
```

### Create Pre-commit Hook

**File**: `.husky/pre-commit`

```bash
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

# Check for large files (> 1MB)
LARGE_FILES=$(git diff --cached --name-only | while read file; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt 1048576 ]; then
      echo "$file ($(($size / 1048576))MB)"
    fi
  fi
done)
if [ -n "$LARGE_FILES" ]; then
  echo "⚠️  WARNING: Large files detected:"
  echo "$LARGE_FILES"
  echo ""
  echo "Consider using Git LFS for large files."
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "✅ Pre-commit checks passed"
```

### Make Hook Executable

```bash
chmod +x .husky/pre-commit

# Verify
ls -la .husky/pre-commit
# Expected: -rwxr-xr-x (executable)
```

### Test Pre-commit Hook

```bash
# Test 1: Try to commit .env file (should fail)
echo "test" > .env
git add .env
git commit -m "test"
# Expected: ❌ ERROR: Attempting to commit secret files!

# Clean up
git reset HEAD .env
rm .env

# Test 2: Try to commit hardcoded secret (should fail)
echo 'const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"' > test.ts
git add test.ts
git commit -m "test"
# Expected: ⚠️  WARNING: Possible hardcoded secrets detected!

# Clean up
git reset HEAD test.ts
rm test.ts

# Test 3: Commit safe file (should succeed)
echo "test" > test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"
# Expected: ✅ Pre-commit checks passed

# Clean up
git reset --soft HEAD~1
rm test.txt
```

---

## 5. Environment File Management

### Create .env.example Files

**Root .env.example**:

```bash
cat > .env.example << 'EOF'
# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# For local development, use:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Discord Webhook (Optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
EOF
```

**Web Dashboard .env.example**:

```bash
cat > web-dashboard/.env.example << 'EOF'
# Supabase Configuration (Public - safe for client-side)
# Get these from: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# For local development:
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
EOF
```

### Create Actual .env Files (NOT Committed)

```bash
# Copy example to create actual .env
cp .env.example .env
cp web-dashboard/.env.example web-dashboard/.env.local

# Edit with real values (use your editor)
# NEVER commit these files!

# Verify they're ignored
git check-ignore .env web-dashboard/.env.local
# Expected: Both files listed (means ignored)
```

### Verify .env Files Are Ignored

```bash
# Check .gitignore contains .env patterns
grep -E "^\.env" .gitignore
# Expected: Multiple .env patterns

# Try to stage .env (should fail or be ignored)
git add .env 2>&1 | grep "ignored" || echo "⚠️  WARNING: .env is NOT ignored!"

# Verify .env.example CAN be committed
git add .env.example
git status
# Expected: .env.example staged (this is correct)

# Unstage for now
git reset HEAD .env.example
```

---

## 6. Secret Storage Locations

### Local Development

**Location**: `.env` files (NOT committed)

```bash
# Root .env (for desktop app)
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Web dashboard .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### GitHub Secrets (for CI/CD)

**Location**: Repository → Settings → Secrets and variables → Actions

```bash
# Add these secrets:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (your actual key)
VERCEL_TOKEN=... (from Vercel settings)
```

**How to add**:
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `SUPABASE_URL`
5. Value: `https://your-project.supabase.co`
6. Click "Add secret"
7. Repeat for other secrets

### Vercel Environment Variables (for Web Dashboard)

**Location**: Vercel Dashboard → Project → Settings → Environment Variables

```bash
# Add these variables:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (your actual key)
```

**How to add**:
1. Go to Vercel dashboard
2. Select project
3. Settings → Environment Variables
4. Add variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environments: Production, Preview, Development
5. Click "Save"
6. Repeat for other variables

---

## 7. Secret Rotation

### When to Rotate Secrets

- **Immediately**: If secrets are exposed (committed to Git, leaked, etc.)
- **Regularly**: Every 90 days (best practice)
- **Team changes**: When team member leaves
- **Suspected compromise**: Any suspicious activity

### How to Rotate Secrets

```bash
# 1. Generate new Supabase key
# Go to: Supabase Dashboard → Settings → API → Reset anon key

# 2. Update GitHub Secrets
# Settings → Secrets → SUPABASE_ANON_KEY → Update

# 3. Update Vercel Environment Variables
# Vercel → Settings → Environment Variables → Edit

# 4. Update local .env files
# Edit .env and web-dashboard/.env.local with new key

# 5. Redeploy applications
vercel --prod
git tag v0.1.1
git push origin v0.1.1

# 6. Verify old key no longer works
curl "https://your-project.supabase.co/rest/v1/theme_usage" \
  -H "apikey: old-key"
# Expected: 401 Unauthorized

# 7. Document rotation
echo "$(date): Rotated Supabase anon key" >> SECURITY_LOG.md
```

---

## 8. Emergency: Secrets Exposed

### If Secrets Are Committed to Git

**IMMEDIATE ACTIONS**:

```bash
# 1. Rotate ALL exposed secrets immediately
# - Generate new Supabase keys
# - Create new Discord webhook
# - Update all secret stores

# 2. Remove secrets from Git history
# WARNING: This rewrites history!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (if already pushed)
git push origin --force --all
git push origin --force --tags

# 4. Notify team
echo "⚠️  SECURITY INCIDENT: Secrets were exposed and have been rotated"

# 5. Document incident
cat >> SECURITY_LOG.md << EOF
$(date): Security incident - secrets exposed in commit
- Affected secrets: SUPABASE_ANON_KEY, DISCORD_WEBHOOK
- Action taken: Rotated all secrets, removed from Git history
- Status: Resolved
EOF
```

### Alternative: BFG Repo-Cleaner (Faster)

```bash
# Install BFG
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env files from history
bfg --delete-files .env

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin --force --all
```

---

## 9. Security Verification Checklist

### Before ANY Commit

```bash
# 1. Check for secrets in staged files
git diff --cached | grep -i "supabase_anon_key\|discord_webhook\|password\|secret\|api_key" || echo "✅ No secrets found"

# 2. Verify .env files are ignored
git status | grep "\.env" && echo "❌ ERROR: .env file not ignored!" || echo "✅ .env files ignored"

# 3. Run pre-commit hook manually
.husky/pre-commit
# Expected: ✅ Pre-commit checks passed

# 4. Check for large files
git diff --cached --stat | awk '{if ($3 > 1000) print $0}'
# Expected: No files > 1000 lines (except generated files)
```

### Before Push to Remote

```bash
# 1. Check for secrets in recent commits
git log -p -5 | grep -i "password\|secret\|key.*=" || echo "✅ No secrets in recent commits"

# 2. Verify .env files not in history
git log --all --full-history -- "*.env"
# Expected: No results (empty)

# 3. Check branch is clean
git status
# Expected: nothing to commit, working tree clean

# 4. Verify remote URL
git remote -v
# Expected: Correct repository URL
```

### Regular Security Audit

```bash
# Run weekly or before major releases

# 1. Check for exposed secrets in entire history
git log -p | grep -i "supabase_anon_key.*eyJ" && echo "❌ SECRET EXPOSED!" || echo "✅ No secrets in history"

# 2. Audit dependencies for vulnerabilities
npm audit
cargo audit

# 3. Check for outdated dependencies
npm outdated
cargo outdated

# 4. Verify .gitignore is complete
cat .gitignore | grep -E "\.env|\.key|\.pem|secrets"
# Expected: All secret patterns present

# 5. Test pre-commit hooks
.husky/pre-commit
# Expected: ✅ Pre-commit checks passed
```

---

## 10. Best Practices Summary

### DO ✅

- **Use .env files** for all secrets
- **Add .env to .gitignore** immediately
- **Create .env.example** with placeholders
- **Use environment variables** in code (`process.env.X`)
- **Store production secrets** in GitHub Secrets / Vercel
- **Rotate secrets regularly** (every 90 days)
- **Use pre-commit hooks** to prevent leaks
- **Commit after each milestone** with clear messages
- **Use feature branches** for each phase
- **Follow conventional commits** format
- **Review diffs before committing** (`git diff --cached`)

### DON'T ❌

- **Never commit .env files** to Git
- **Never hardcode secrets** in code
- **Never commit API keys** or passwords
- **Never push secrets** to public repositories
- **Never share .env files** via email/chat
- **Never commit large files** (> 1MB) without LFS
- **Never force push** to main branch (except emergencies)
- **Never skip pre-commit hooks**
- **Never commit directly to main** (use feature branches)
- **Never use vague commit messages** ("fix stuff", "update")

---

## 11. Quick Reference

### Common Commands

```bash
# Check if file is ignored
git check-ignore .env

# View staged changes
git diff --cached

# Unstage file
git reset HEAD .env

# Amend last commit (before push)
git commit --amend

# View commit history
git log --oneline -10

# Search for secrets in history
git log -p | grep -i "password\|secret\|key"

# Remove file from Git (keep local)
git rm --cached .env

# Force add ignored file (DANGEROUS - avoid)
git add -f .env  # DON'T DO THIS!
```

### Emergency Contacts

If secrets are exposed:
1. Rotate secrets immediately
2. Remove from Git history
3. Force push to remote
4. Notify team
5. Document incident

---

## Verification

```bash
# Run all security checks
echo "🔍 Running security verification..."

# 1. Check .gitignore
grep -E "^\.env" .gitignore && echo "✅ .gitignore configured" || echo "❌ .gitignore missing .env"

# 2. Check pre-commit hooks
[ -x .husky/pre-commit ] && echo "✅ Pre-commit hooks installed" || echo "❌ Pre-commit hooks missing"

# 3. Check .env.example exists
[ -f .env.example ] && echo "✅ .env.example exists" || echo "❌ .env.example missing"

# 4. Verify .env is ignored
git check-ignore .env && echo "✅ .env is ignored" || echo "❌ .env is NOT ignored"

# 5. Check for secrets in history
git log -p | grep -i "supabase_anon_key.*eyJ" && echo "❌ SECRETS IN HISTORY!" || echo "✅ No secrets in history"

echo "✅ Security verification complete"
```

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-23  
**Status**: Production Ready

**Next**: Return to `00_README.md` for reading order


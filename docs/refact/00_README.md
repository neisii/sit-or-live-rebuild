# Project Reconstruction Documentation

## 📚 Purpose

This directory contains comprehensive documentation to enable AI agents to rebuild the **sit-or-live** project from scratch in a new environment, achieving production-ready quality with minimal human intervention.

## 🎯 Documentation Philosophy

1. **Deterministic Development**: Minimize variables and changes during implementation
2. **AI-First Approach**: Written for AI consumption with clear, unambiguous instructions
3. **Complete Specification**: All decisions pre-made to avoid mid-development changes
4. **Environment Agnostic**: Works in both local development and production
5. **Quality Assurance**: Built-in testing and verification at each stage

## 🚀 Quick Start for New Sessions

**⚠️ START HERE**: If you're a new AI session tasked with rebuilding this project:

👉 **Read `00_REBUILD_INSTRUCTIONS.md` FIRST** 👈

This document contains:
- Complete list of implemented features (15 desktop + 4 web)
- Step-by-step rebuild guide
- Verification steps
- All code examples

**Then** proceed with the detailed reading order below for deeper understanding.

---

## 📖 Reading Order (MANDATORY)

AI agents MUST read documents in this exact order:

### Phase 0: Understanding (30 minutes)
1. **`00_REBUILD_INSTRUCTIONS.md`** - ⭐ Complete rebuild guide (START HERE)
2. **`01_PROJECT_OVERVIEW.md`** - What we're building and why
3. **`02_TECHNICAL_ARCHITECTURE.md`** - System design and technology choices
4. **`03_DESIGN_DECISIONS.md`** - All architectural decisions with rationale

### Phase 1: Environment Setup (1 hour)
4. **`04_ENVIRONMENT_SETUP.md`** - Complete development environment
5. **`05_DEPENDENCIES.md`** - All dependencies with exact versions
6. **`06_CONFIGURATION.md`** - All configuration files and settings

### Phase 2: Core Implementation (8-10 hours)
7. **`07_DATABASE_SCHEMA.md`** - Complete database design
8. **`08_API_SPECIFICATIONS.md`** - All external API integrations
9. **`09_COMPONENT_SPECIFICATIONS.md`** - Every component with props/state
10. **`10_SERVICE_LAYER.md`** - All services and business logic
11. **`11_RUST_BACKEND.md`** - Tauri Rust implementation
12. **`12_THEME_SYSTEM.md`** - Complete theme generation system

### Phase 3: Integration (2-3 hours)
13. **`13_KIRO_INTEGRATION.md`** - Hooks, MCP, Steering setup
14. **`14_WEB_DASHBOARD.md`** - Next.js dashboard implementation
15. **`15_REALTIME_SYSTEM.md`** - WebSocket and real-time features

### Phase 4: Quality Assurance (2-3 hours)
16. **`16_TESTING_STRATEGY.md`** - Complete testing approach
17. **`17_E2E_SCENARIOS.md`** - All E2E test scenarios
18. **`18_DEPLOYMENT.md`** - Production deployment steps

### Phase 5: Finalization (1 hour)
19. **`19_DOCUMENTATION.md`** - README and user documentation
20. **`20_VERIFICATION_CHECKLIST.md`** - Final quality checks
21. **`21_SECURITY_PRACTICES.md`** - Git security and secrets management

## 🚀 Quick Start for AI

```bash
# 1. Read this file first
cat docs/_refact/00_README.md

# 2. Read security practices IMMEDIATELY
cat docs/_refact/21_SECURITY_PRACTICES.md

# 3. Follow reading order exactly
for i in {01..20}; do
  cat docs/_refact/${i}_*.md
done

# 4. Execute implementation phases
# (Each document contains executable instructions)
```

## 📋 Document Structure

Each document follows this structure:

```markdown
# [Number]_[TITLE]

## Purpose
What this document covers

## Prerequisites
What must be completed before this

## Specifications
Exact specifications (no ambiguity)

## Implementation Steps
Step-by-step instructions

## Verification
How to verify completion

## Next Steps
What to read/do next
```

## 🎯 Key Principles

### 1. Zero Ambiguity
- Every decision is documented
- No "choose between X or Y"
- Exact versions, exact commands
- No assumptions

### 2. Deterministic Execution
- Same input → Same output
- No random choices
- No "it depends"
- Reproducible builds

### 3. Minimal Human Intervention
- AI can execute 95% autonomously
- Human only needed for:
  - API keys/credentials
  - Platform-specific permissions
  - Final review

### 4. Built-in Quality
- Testing at every phase
- Verification checkpoints
- Error prevention, not correction
- Production-ready from start

## 🔐 Git Workflow & Security

### Git Commit Strategy

**Commit after each major milestone:**

```bash
# After completing Phase 0 (Understanding)
git add docs/_refact/01_*.md docs/_refact/02_*.md docs/_refact/03_*.md
git commit -m "docs: complete Phase 0 - Understanding"

# After completing Phase 1 (Environment Setup)
git add .
git commit -m "feat: complete Phase 1 - Environment setup"

# After completing Phase 2 (Core Implementation)
git add src/ src-tauri/ themes/
git commit -m "feat: complete Phase 2 - Core implementation"

# After completing Phase 3 (Integration)
git add .kiro/ web-dashboard/
git commit -m "feat: complete Phase 3 - Integration"

# After completing Phase 4 (Quality Assurance)
git add tests/ playwright.config.ts
git commit -m "test: complete Phase 4 - Quality assurance"

# After completing Phase 5 (Finalization)
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
git commit -m "feat: complete environment setup"
git checkout main
git merge feature/phase-1-environment
git branch -d feature/phase-1-environment

# Phase 2: Core Implementation
git checkout -b feature/phase-2-core
# ... work on Phase 2 ...
git commit -m "feat: complete core implementation"
git checkout main
git merge feature/phase-2-core
git branch -d feature/phase-2-core

# Phase 3: Integration
git checkout -b feature/phase-3-integration
# ... work on Phase 3 ...
git commit -m "feat: complete integration"
git checkout main
git merge feature/phase-3-integration
git branch -d feature/phase-3-integration

# Phase 4: Quality
git checkout -b feature/phase-4-quality
# ... work on Phase 4 ...
git commit -m "test: complete quality assurance"
git checkout main
git merge feature/phase-4-quality
git branch -d feature/phase-4-quality

# Phase 5: Finalization
git checkout -b feature/phase-5-finalization
# ... work on Phase 5 ...
git commit -m "docs: complete finalization"
git checkout main
git merge feature/phase-5-finalization
git branch -d feature/phase-5-finalization
```

### Conventional Commit Messages

Use these prefixes:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `perf:` - Performance improvements

### Secrets Management

**CRITICAL: Never commit secrets!**

**Files that MUST be in .gitignore:**
```
.env
.env.local
.env.production
.env.*.local
web-dashboard/.env
web-dashboard/.env.local
web-dashboard/.env.production
*.key
*.pem
*.p12
secrets/
```

**Use .env.example files instead:**

```bash
# Create .env.example with placeholders
cat > .env.example << 'EOF'
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# For local development, use:
# SUPABASE_URL=http://127.0.0.1:54321
# SUPABASE_ANON_KEY=eyJhbGc...
EOF

# Create actual .env from example
cp .env.example .env
# Then edit .env with real values
```

**Where to store production secrets:**
- **GitHub**: Settings → Secrets and variables → Actions
- **Vercel**: Project Settings → Environment Variables
- **Supabase**: Dashboard → Project Settings → API

### Pre-commit Hooks

**Install pre-commit hooks to prevent secret leaks:**

```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check for secrets
if git diff --cached --name-only | grep -E '\.(env|key|pem|p12)$'; then
  echo "❌ ERROR: Attempting to commit secret files!"
  echo "Files with secrets detected. Please remove them from staging."
  exit 1
fi

# Check for hardcoded secrets in code
if git diff --cached | grep -E '(SUPABASE_URL|SUPABASE_ANON_KEY|DISCORD_WEBHOOK|API_KEY|SECRET|PASSWORD).*=.*[a-zA-Z0-9]{20,}'; then
  echo "⚠️  WARNING: Possible hardcoded secrets detected!"
  echo "Please use environment variables instead."
  exit 1
fi

echo "✅ Pre-commit checks passed"
EOF

chmod +x .husky/pre-commit
```

### Security Verification

**Before any commit, verify:**

```bash
# Check .gitignore is complete
cat .gitignore | grep -E '\.env|\.key|\.pem|secrets'

# Verify no secrets in staged files
git diff --cached | grep -i 'password\|secret\|key' || echo "✅ No secrets found"

# Check for .env files
find . -name ".env*" -not -name "*.example" -not -path "*/node_modules/*"

# Verify .env files are ignored
git check-ignore .env .env.local .env.production
# Expected: All should be ignored
```

## 🔍 Reference Materials

### Existing Documentation (Read for Context)
- `docs/PROJECT_PLAN.md` - Original project plan
- `docs/SETUP.md` - Current setup guide
- `docs/DATABASE_FEATURES.md` - Database implementation
- `docs/TIMER_SYSTEM_DESIGN.md` - Timer system design
- `E2E_TESTING_GUIDE.md` - E2E testing approach

### Code Analysis Required
AI must analyze these directories:
- `src/` - Frontend React/TypeScript code
- `src-tauri/` - Backend Rust code
- `web-dashboard/` - Next.js dashboard
- `.kiro/` - Kiro integration
- `themes/` - Theme system

## ⚠️ Critical Rules for AI

### DO:
✅ Follow reading order exactly
✅ Complete each phase before moving to next
✅ Verify at each checkpoint
✅ Use exact versions specified
✅ Copy code patterns exactly
✅ Test continuously

### DON'T:
❌ Skip documents
❌ Change technology choices
❌ Modify specifications
❌ Add "improvements" mid-development
❌ Use different versions
❌ Assume anything not documented

## 🎓 Learning from This Project

### What Worked Well
1. **Tauri over Electron** - 20x smaller, 10x faster
2. **Dual timer system** - Flexibility for different needs
3. **Local-first privacy** - No personal data on server
4. **WebSocket real-time** - Better than polling
5. **Comprehensive documentation** - 40+ docs

### What to Avoid
1. **Mid-development changes** - Causes delays and bugs
2. **Incomplete specifications** - Leads to rework
3. **Technology experiments** - Stick to proven stack
4. **Scope creep** - Focus on core features first
5. **Insufficient testing** - Test early and often

## 📊 Expected Timeline

| Phase | Duration | Completion |
|-------|----------|------------|
| Phase 0: Understanding | 30 min | 2% |
| Phase 1: Environment | 1 hour | 10% |
| Phase 2: Core Implementation | 8-10 hours | 70% |
| Phase 3: Integration | 2-3 hours | 85% |
| Phase 4: Quality Assurance | 2-3 hours | 95% |
| Phase 5: Finalization | 1 hour | 100% |
| **Total** | **14-18 hours** | **100%** |

**Note**: Read `21_SECURITY_PRACTICES.md` at the start to understand Git workflow and secrets management.

## 🎯 Success Criteria

Project is complete when:
- ✅ All 20 documents read and executed
- ✅ All verification checkpoints passed
- ✅ 100% E2E tests passing
- ✅ Production deployment successful
- ✅ Documentation complete
- ✅ Demo video created

## 🔄 Iteration Strategy

If rebuilding fails:
1. Identify which phase failed
2. Review that phase's document
3. Check prerequisites were met
4. Verify exact specifications followed
5. Re-execute from that phase

## 📝 Document Maintenance

When updating this documentation:
1. Update version number in each doc
2. Update reading order if structure changes
3. Update timeline estimates
4. Add lessons learned
5. Keep specifications deterministic

## 🎬 Next Steps

**For AI Agent Starting Fresh:**
1. Read `01_PROJECT_OVERVIEW.md` next
2. Follow reading order strictly
3. Execute each phase completely
4. Verify at each checkpoint
5. Report progress at phase boundaries

**For Human Supervisor:**
1. Provide API keys when requested
2. Review at phase boundaries
3. Approve production deployment
4. Minimal intervention otherwise

---

## 📝 Recent Updates

**2025-11-24**: Updated `09_COMPONENT_SPECIFICATIONS.md` to reflect actual production implementation with advanced features:
- Activity intensity visualization
- Eye strain color coding
- Hover popups for settings
- Discord/IDE/Terminal integration
- Log management UI
- Compact 320px design

**Note**: The specifications now match the **current production code** exactly, not just the minimal viable implementation.

---

**Version**: 1.1.0  
**Last Updated**: 2025-11-24  
**Maintainer**: Project Team  
**Status**: Production Ready (Updated)

**Start Reading**: `01_PROJECT_OVERVIEW.md` →

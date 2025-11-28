# macOS Build Guide

**Project**: Sit or Live  
**Platform**: macOS only  
**Date**: November 27, 2025

---

## Why macOS Only?

Sit or Live uses macOS-specific APIs for core features:

- **Idle Time Detection**: Uses `ioreg -c IOHIDSystem` to read HIDIdleTime
- **Dark Mode Control**: Uses AppleScript to toggle system appearance
- **System Integration**: Deep integration with macOS system preferences

These features cannot be easily ported to Windows/Linux without significant platform-specific implementations.

---

## Requirements

- macOS 10.15 (Catalina) or later
- Node.js 20.x or later
- Rust 1.70+ (installed via rustup)
- Xcode Command Line Tools

---

## Installation

### 1. Install Prerequisites

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Xcode Command Line Tools
xcode-select --install
```

### 2. Clone and Setup

```bash
# Clone repository
git clone https://github.com/yourusername/sit-or-live.git
cd sit-or-live

# Install dependencies
npm install
```

---

## Development

### Start Development Server

```bash
npm run tauri:dev
```

This will:
1. Start Vite dev server (React frontend)
2. Build Rust backend
3. Launch the Tauri app in development mode

**Hot Reload**: Frontend changes reload automatically. Rust changes require restart.

### Development Commands

```bash
# Frontend only (for UI development)
npm run dev

# Type checking
tsc --noEmit

# Lint
npm run lint

# Generate theme files
npm run generate-themes
```

---

## Building for Production

### Build macOS App

```bash
npm run tauri:build
```

**Output**: `src-tauri/target/release/bundle/macos/sit-or-live.app`

### Build Options

```bash
# Build for Intel Macs (x86_64)
npm run tauri:build -- --target x86_64-apple-darwin

# Build for Apple Silicon (ARM64)
npm run tauri:build -- --target aarch64-apple-darwin

# Build Universal Binary (both architectures)
npm run tauri:build -- --target universal-apple-darwin
```

### Build Artifacts

After building, you'll find:

```
src-tauri/target/release/bundle/
├── macos/
│   └── sit-or-live.app          # macOS application bundle
└── dmg/
    └── sit-or-live_0.1.0.dmg    # DMG installer (if configured)
```

---

## Distribution

### Option 1: Direct Distribution

Simply share the `.app` bundle:

```bash
# Compress the app
cd src-tauri/target/release/bundle/macos
zip -r sit-or-live.zip sit-or-live.app
```

Users can:
1. Download and unzip
2. Drag to Applications folder
3. Run the app

### Option 2: DMG Installer

Configure DMG in `src-tauri/tauri.conf.json`:

```json
{
  "bundle": {
    "macOS": {
      "dmg": {
        "background": "path/to/background.png",
        "windowSize": {
          "width": 540,
          "height": 380
        }
      }
    }
  }
}
```

### Option 3: Code Signing (Recommended)

For distribution outside the App Store:

```bash
# Get Developer ID certificate from Apple Developer account
# Then sign the app
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" sit-or-live.app

# Notarize with Apple
xcrun notarytool submit sit-or-live.zip --apple-id your@email.com --password app-specific-password --team-id TEAMID
```

---

## Testing

### Manual Testing

```bash
# Run the built app
open src-tauri/target/release/bundle/macos/sit-or-live.app
```

**Test Checklist**:
- [ ] App launches successfully
- [ ] Weather fetching works
- [ ] Theme switching works
- [ ] Idle time detection works
- [ ] Dark mode toggle works
- [ ] Health monitoring works
- [ ] Eye break reminders work
- [ ] Settings persist
- [ ] Language switching works

### Automated Testing

```bash
# Run unit tests
npm test

# Run Rust tests
cd src-tauri
cargo test
```

---

## Troubleshooting

### Issue: "App is damaged and can't be opened"

**Cause**: Gatekeeper blocking unsigned app

**Solution**:
```bash
xattr -cr sit-or-live.app
```

### Issue: Idle time always returns 0

**Cause**: Missing permissions

**Solution**: Grant accessibility permissions in System Preferences → Security & Privacy → Privacy → Accessibility

### Issue: Dark mode toggle doesn't work

**Cause**: Missing AppleScript permissions

**Solution**: Grant automation permissions when prompted

### Issue: Build fails with "xcrun: error"

**Cause**: Xcode Command Line Tools not installed

**Solution**:
```bash
xcode-select --install
```

---

## Performance

### App Size

- **Development**: ~50 MB (unoptimized)
- **Release**: ~10 MB (optimized)
- **Universal Binary**: ~15 MB (both architectures)

### Resource Usage

- **CPU**: < 1% idle, ~5% when monitoring
- **Memory**: ~50 MB
- **Disk**: ~10 MB

### Optimization Tips

1. **Strip Debug Symbols**:
```toml
[profile.release]
strip = true
```

2. **Enable LTO**:
```toml
[profile.release]
lto = true
```

3. **Optimize Size**:
```toml
[profile.release]
opt-level = "z"
```

---

## Deployment Checklist

Before releasing:

- [ ] Update version in `package.json`
- [ ] Update version in `src-tauri/Cargo.toml`
- [ ] Update version in `src-tauri/tauri.conf.json`
- [ ] Test on Intel Mac
- [ ] Test on Apple Silicon Mac
- [ ] Test on minimum macOS version (10.15)
- [ ] Sign the app with Developer ID
- [ ] Notarize with Apple
- [ ] Create release notes
- [ ] Tag release in Git

---

## CI/CD with GitHub Actions

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run tauri:build -- --target universal-apple-darwin
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/universal-apple-darwin/release/bundle/macos/*.app
            src-tauri/target/universal-apple-darwin/release/bundle/dmg/*.dmg
```

---

## Summary

✅ **macOS-only application**  
✅ **Simple build process**: `npm run tauri:build`  
✅ **Universal binary support**: Intel + Apple Silicon  
✅ **Small app size**: ~10 MB  
✅ **Low resource usage**: < 1% CPU, ~50 MB RAM  

**Next Steps**:
1. Build the app: `npm run tauri:build`
2. Test on your Mac
3. Optionally sign and notarize for distribution

---

**Last Updated**: November 27, 2025  
**Status**: Production Ready

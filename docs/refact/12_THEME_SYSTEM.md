# 12_THEME_SYSTEM

## Purpose

Complete theme generation system that creates 42 theme files (6 themes × 7 platforms) from a single color definition file.

## Prerequisites

- Node.js installed
- Understanding of Base16 color scheme
- Knowledge of theme formats (JSON, YAML, conf)

## Theme Architecture

```
themes/
└── colors.json          # Source of truth (6 themes)

scripts/
└── generate-theme-presets.cjs  # Generator script

src-tauri/themes/        # Generated files (42 total)
├── vscode/              # 6 files
├── kiro/                # 6 files
├── iterm2/              # 6 files
├── warp/                # 6 files
├── kitty/               # 6 files
├── hyper/               # 6 files
└── terminal/            # 6 files
```

## Color Definitions

**File**: `themes/colors.json`

```json
{
  "daylight-survivor": {
    "name": "Daylight Survivor",
    "base00": "FFF8DC",
    "base01": "F5DEB3",
    "base02": "DEB887",
    "base03": "D2691E",
    "base04": "8B4513",
    "base05": "654321",
    "base06": "3E2723",
    "base07": "1C0A00",
    "base08": "FF6347",
    "base09": "FF8C00",
    "base0A": "FFD700",
    "base0B": "32CD32",
    "base0C": "00CED1",
    "base0D": "1E90FF",
    "base0E": "9370DB",
    "base0F": "FF1493"
  },
  "vampire-night": {
    "name": "Vampire Night",
    "base00": "0D0D0D",
    "base01": "1A1A1A",
    "base02": "2D2D2D",
    "base03": "4D4D4D",
    "base04": "6D6D6D",
    "base05": "CCCCCC",
    "base06": "E0E0E0",
    "base07": "FFFFFF",
    "base08": "DC143C",
    "base09": "FF4500",
    "base0A": "FFD700",
    "base0B": "00FF00",
    "base0C": "00FFFF",
    "base0D": "1E90FF",
    "base0E": "9400D3",
    "base0F": "FF1493"
  },
  "silent-hill": {
    "name": "Silent Hill",
    "base00": "2F4F4F",
    "base01": "3C5A5A",
    "base02": "4A6565",
    "base03": "708090",
    "base04": "8B9A9A",
    "base05": "A9A9A9",
    "base06": "C0C0C0",
    "base07": "D3D3D3",
    "base08": "CD5C5C",
    "base09": "F4A460",
    "base0A": "F0E68C",
    "base0B": "90EE90",
    "base0C": "AFEEEE",
    "base0D": "87CEEB",
    "base0E": "DDA0DD",
    "base0F": "FFB6C1"
  },
  "rainy-cemetery": {
    "name": "Rainy Cemetery",
    "base00": "1C1C2E",
    "base01": "252538",
    "base02": "2E2E42",
    "base03": "4A4A5E",
    "base04": "6A6A7E",
    "base05": "A0A0B0",
    "base06": "C0C0D0",
    "base07": "E0E0F0",
    "base08": "FF6B6B",
    "base09": "FFA07A",
    "base0A": "FFD700",
    "base0B": "98D8C8",
    "base0C": "6495ED",
    "base0D": "4682B4",
    "base0E": "9370DB",
    "base0F": "FF69B4"
  },
  "frozen-dead": {
    "name": "Frozen Dead",
    "base00": "1A1A2E",
    "base01": "232338",
    "base02": "2C2C42",
    "base03": "4A4A5E",
    "base04": "6A6A7E",
    "base05": "B0E0E6",
    "base06": "D0F0F6",
    "base07": "F0FFFF",
    "base08": "FF6B6B",
    "base09": "FFA07A",
    "base0A": "FFE4B5",
    "base0B": "98FB98",
    "base0C": "87CEEB",
    "base0D": "ADD8E6",
    "base0E": "B0C4DE",
    "base0F": "E0FFFF"
  },
  "frankenstein-lab": {
    "name": "Frankenstein Lab",
    "base00": "0F0F1E",
    "base01": "1A1A2E",
    "base02": "252538",
    "base03": "4A4A5E",
    "base04": "6A6A7E",
    "base05": "D8BFD8",
    "base06": "E6D5E6",
    "base07": "F5EBF5",
    "base08": "FF00FF",
    "base09": "FF1493",
    "base0A": "FFD700",
    "base0B": "00FF00",
    "base0C": "00FFFF",
    "base0D": "8A2BE2",
    "base0E": "9370DB",
    "base0F": "FF00FF"
  }
}
```

## Generation Script

**File**: `scripts/generate-theme-presets.cjs`

**Run Command**:
```bash
npm run generate-themes
```

**Expected Output**:
```
✅ Generated 42 theme preset files!
   6 themes × 7 targets = 42 files
   Output: src-tauri/themes/
```

**Script Logic**:
1. Load `themes/colors.json`
2. For each theme:
   - Generate VS Code theme (JSON)
   - Generate Kiro theme (JSON, same as VS Code)
   - Generate iTerm2 theme (JSON with RGB conversion)
   - Generate Warp theme (YAML)
   - Generate Kitty theme (conf)
   - Generate Hyper theme (JS module)
   - Generate macOS Terminal theme (plist XML)
3. Write 42 files to `src-tauri/themes/`

## Theme Formats

### VS Code / Kiro (JSON)

```json
{
  "name": "Sit or Live - Daylight Survivor",
  "type": "light",
  "colors": {
    "editor.background": "#FFF8DC",
    "editor.foreground": "#654321",
    "terminal.ansiBlack": "#FFF8DC",
    "terminal.ansiRed": "#FF6347",
    "terminal.ansiGreen": "#32CD32",
    "terminal.ansiYellow": "#FFD700",
    "terminal.ansiBlue": "#1E90FF",
    "terminal.ansiMagenta": "#9370DB",
    "terminal.ansiCyan": "#00CED1",
    "terminal.ansiWhite": "#654321"
  },
  "tokenColors": [
    {
      "scope": ["comment"],
      "settings": { "foreground": "#D2691E" }
    },
    {
      "scope": ["string"],
      "settings": { "foreground": "#32CD32" }
    }
  ]
}
```

### iTerm2 (JSON with RGB)

```json
{
  "Profiles": [{
    "Name": "Sit or Live - Daylight Survivor",
    "Background Color": {
      "Red Component": 1.0,
      "Green Component": 0.973,
      "Blue Component": 0.863
    },
    "Ansi 0 Color": {
      "Red Component": 1.0,
      "Green Component": 0.973,
      "Blue Component": 0.863
    }
  }]
}
```

### Warp (YAML)

```yaml
name: Sit or Live - Daylight Survivor
background: '#FFF8DC'
foreground: '#654321'
details: lighter
accent: '#1E90FF'
terminal_colors:
  normal:
    black: '#FFF8DC'
    red: '#FF6347'
    green: '#32CD32'
    yellow: '#FFD700'
    blue: '#1E90FF'
    magenta: '#9370DB'
    cyan: '#00CED1'
    white: '#654321'
```

### Kitty (conf)

```conf
# Sit or Live - Daylight Survivor
background #FFF8DC
foreground #654321
selection_background #DEB887
selection_foreground #654321
cursor #654321
color0 #FFF8DC
color1 #FF6347
color2 #32CD32
color3 #FFD700
color4 #1E90FF
color5 #9370DB
color6 #00CED1
color7 #654321
```

### Hyper (JS)

```javascript
// Sit or Live - Daylight Survivor
module.exports = {
  config: {
    backgroundColor: '#FFF8DC',
    foregroundColor: '#654321',
    borderColor: '#DEB887',
    cursorColor: '#654321',
    colors: {
      black: '#FFF8DC',
      red: '#FF6347',
      green: '#32CD32',
      yellow: '#FFD700',
      blue: '#1E90FF',
      magenta: '#9370DB',
      cyan: '#00CED1',
      white: '#654321'
    }
  }
};
```

## Implementation Steps

### 1. Create Color Definitions

```bash
# Create themes directory
mkdir -p themes

# Create colors.json
cat > themes/colors.json << 'EOF'
[paste complete JSON from above]
EOF
```

### 2. Create Generation Script

```bash
# Create scripts directory
mkdir -p scripts

# Create generator
cat > scripts/generate-theme-presets.cjs << 'EOF'
[paste complete script from project]
EOF
```

### 3. Generate Themes

```bash
# Run generator
npm run generate-themes

# Expected output:
# ✅ Generated 42 theme preset files!
#    6 themes × 7 targets = 42 files
#    Output: src-tauri/themes/

# Verify files
ls -la src-tauri/themes/vscode/
# Expected: 6 JSON files

ls -la src-tauri/themes/warp/
# Expected: 6 YAML files
```

### 4. Embed in Rust

Themes are embedded at compile time using `include_str!`:

```rust
// In theme_manager.rs
let theme_content = match (ide, theme_name) {
    ("vscode", "daylight-survivor") => include_str!("../themes/vscode/daylight-survivor.json"),
    // ... 41 more matches
};
```

## Verification

### Check Generated Files

```bash
# Count files
find src-tauri/themes -type f | wc -l
# Expected: 42

# Check each directory
for dir in vscode kiro iterm2 warp kitty hyper terminal; do
  echo "$dir: $(ls src-tauri/themes/$dir | wc -l) files"
done

# Expected output:
# vscode: 6 files
# kiro: 6 files
# iterm2: 6 files
# warp: 6 files
# kitty: 6 files
# hyper: 6 files
# terminal: 6 files
```

### Test Theme Application

```bash
# Build app
npm run tauri:build

# Run app
./src-tauri/target/release/sit-or-live

# Test theme change:
# 1. Select IDE (VS Code or Kiro)
# 2. Select Terminal (iTerm2, Warp, etc.)
# 3. Change location to trigger weather change
# 4. Verify theme files are updated
```

### Verify Theme Files

```bash
# Check VS Code theme
cat ~/.vscode/settings.json
# Expected: "workbench.colorTheme": "Sit or Live - [Theme Name]"

# Check iTerm2 theme
cat ~/Library/Application\ Support/iTerm2/DynamicProfiles/sit-or-live.json
# Expected: Valid JSON with theme colors

# Check Warp theme
cat ~/.warp/themes/sit-or-live.yaml
# Expected: Valid YAML with theme colors
```

## Troubleshooting

### Issue: Generator script fails

**Solution**:
```bash
# Check Node.js version
node --version
# Expected: v20.11.0 or later

# Check colors.json exists
ls -la themes/colors.json

# Run with verbose output
node scripts/generate-theme-presets.cjs
```

### Issue: Themes not applied

**Solution**:
1. Check IDE/Terminal is selected in app settings
2. Verify theme files exist in `src-tauri/themes/`
3. Check Rust build includes themes: `cargo build --verbose`
4. Verify `include_str!` paths are correct

### Issue: Colors look wrong

**Solution**:
1. Verify hex colors in `colors.json` (6 digits, no #)
2. Regenerate themes: `npm run generate-themes`
3. Rebuild app: `npm run tauri:build`

## Next Steps

Proceed to `13_KIRO_INTEGRATION.md` for Kiro Hooks, MCP, and Steering setup.

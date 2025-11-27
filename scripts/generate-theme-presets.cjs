const fs = require('fs');
const path = require('path');

// Load color definitions
const colors = require('../themes/colors.json');

// Helper: Convert hex to RGB (0-1 range for iTerm2)
function hexToRgb(hex) {
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b };
}

// Generate VS Code theme
function generateVSCodeTheme(themeId, theme) {
  const isDark = parseInt(theme.base00.substring(0, 2), 16) < 128;
  
  return {
    name: `Sit or Live - ${theme.name}`,
    type: isDark ? 'dark' : 'light',
    colors: {
      'editor.background': `#${theme.base00}`,
      'editor.foreground': `#${theme.base05}`,
      'editorCursor.foreground': `#${theme.base05}`,
      'editor.lineHighlightBackground': `#${theme.base01}`,
      'editor.selectionBackground': `#${theme.base02}`,
      'sideBar.background': `#${theme.base01}`,
      'activityBar.background': `#${theme.base01}`,
      'statusBar.background': `#${theme.base02}`,
      'terminal.ansiBlack': `#${theme.base00}`,
      'terminal.ansiRed': `#${theme.base08}`,
      'terminal.ansiGreen': `#${theme.base0B}`,
      'terminal.ansiYellow': `#${theme.base0A}`,
      'terminal.ansiBlue': `#${theme.base0D}`,
      'terminal.ansiMagenta': `#${theme.base0E}`,
      'terminal.ansiCyan': `#${theme.base0C}`,
      'terminal.ansiWhite': `#${theme.base05}`
    },
    tokenColors: [
      {
        scope: ['comment'],
        settings: { foreground: `#${theme.base03}` }
      },
      {
        scope: ['string'],
        settings: { foreground: `#${theme.base0B}` }
      },
      {
        scope: ['keyword', 'storage'],
        settings: { foreground: `#${theme.base0E}` }
      },
      {
        scope: ['function'],
        settings: { foreground: `#${theme.base0D}` }
      },
      {
        scope: ['variable'],
        settings: { foreground: `#${theme.base08}` }
      }
    ]
  };
}

// Generate iTerm2 theme
function generateITerm2Theme(themeId, theme) {
  const bg = hexToRgb(theme.base00);
  const fg = hexToRgb(theme.base05);
  
  return {
    'Profiles': [{
      'Name': `Sit or Live - ${theme.name}`,
      'Background Color': {
        'Red Component': bg.r,
        'Green Component': bg.g,
        'Blue Component': bg.b
      },
      'Foreground Color': {
        'Red Component': fg.r,
        'Green Component': fg.g,
        'Blue Component': fg.b
      },
      'Ansi 0 Color': hexToRgb(theme.base00),
      'Ansi 1 Color': hexToRgb(theme.base08),
      'Ansi 2 Color': hexToRgb(theme.base0B),
      'Ansi 3 Color': hexToRgb(theme.base0A),
      'Ansi 4 Color': hexToRgb(theme.base0D),
      'Ansi 5 Color': hexToRgb(theme.base0E),
      'Ansi 6 Color': hexToRgb(theme.base0C),
      'Ansi 7 Color': hexToRgb(theme.base05)
    }]
  };
}

// Generate Warp theme
function generateWarpTheme(themeId, theme) {
  return `name: Sit or Live - ${theme.name}
background: '#${theme.base00}'
foreground: '#${theme.base05}'
details: darker
accent: '#${theme.base0D}'
terminal_colors:
  normal:
    black: '#${theme.base00}'
    red: '#${theme.base08}'
    green: '#${theme.base0B}'
    yellow: '#${theme.base0A}'
    blue: '#${theme.base0D}'
    magenta: '#${theme.base0E}'
    cyan: '#${theme.base0C}'
    white: '#${theme.base05}'
  bright:
    black: '#${theme.base03}'
    red: '#${theme.base08}'
    green: '#${theme.base0B}'
    yellow: '#${theme.base0A}'
    blue: '#${theme.base0D}'
    magenta: '#${theme.base0E}'
    cyan: '#${theme.base0C}'
    white: '#${theme.base07}'
`;
}

// Generate Kitty theme
function generateKittyTheme(themeId, theme) {
  return `# Sit or Live - ${theme.name}
background #${theme.base00}
foreground #${theme.base05}
selection_background #${theme.base02}
selection_foreground #${theme.base05}
cursor #${theme.base05}
cursor_text_color #${theme.base00}

# Black
color0 #${theme.base00}
color8 #${theme.base03}

# Red
color1 #${theme.base08}
color9 #${theme.base08}

# Green
color2 #${theme.base0B}
color10 #${theme.base0B}

# Yellow
color3 #${theme.base0A}
color11 #${theme.base0A}

# Blue
color4 #${theme.base0D}
color12 #${theme.base0D}

# Magenta
color5 #${theme.base0E}
color13 #${theme.base0E}

# Cyan
color6 #${theme.base0C}
color14 #${theme.base0C}

# White
color7 #${theme.base05}
color15 #${theme.base07}
`;
}

// Generate Hyper theme
function generateHyperTheme(themeId, theme) {
  return `// Sit or Live - ${theme.name}
module.exports = {
  config: {
    backgroundColor: '#${theme.base00}',
    foregroundColor: '#${theme.base05}',
    borderColor: '#${theme.base02}',
    cursorColor: '#${theme.base05}',
    cursorAccentColor: '#${theme.base00}',
    selectionColor: 'rgba(${parseInt(theme.base02.substring(0, 2), 16)}, ${parseInt(theme.base02.substring(2, 4), 16)}, ${parseInt(theme.base02.substring(4, 6), 16)}, 0.5)',
    colors: {
      black: '#${theme.base00}',
      red: '#${theme.base08}',
      green: '#${theme.base0B}',
      yellow: '#${theme.base0A}',
      blue: '#${theme.base0D}',
      magenta: '#${theme.base0E}',
      cyan: '#${theme.base0C}',
      white: '#${theme.base05}',
      lightBlack: '#${theme.base03}',
      lightRed: '#${theme.base08}',
      lightGreen: '#${theme.base0B}',
      lightYellow: '#${theme.base0A}',
      lightBlue: '#${theme.base0D}',
      lightMagenta: '#${theme.base0E}',
      lightCyan: '#${theme.base0C}',
      lightWhite: '#${theme.base07}'
    }
  }
};
`;
}

// Generate macOS Terminal theme (plist)
function generateTerminalTheme(themeId, theme) {
  const bg = hexToRgb(theme.base00);
  const fg = hexToRgb(theme.base05);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>name</key>
  <string>Sit or Live - ${theme.name}</string>
  <key>BackgroundColor</key>
  <data>${Buffer.from([bg.r * 255, bg.g * 255, bg.b * 255]).toString('base64')}</data>
  <key>TextColor</key>
  <data>${Buffer.from([fg.r * 255, fg.g * 255, fg.b * 255]).toString('base64')}</data>
  <key>ANSIBlackColor</key>
  <data>${Buffer.from([parseInt(theme.base00.substring(0, 2), 16), parseInt(theme.base00.substring(2, 4), 16), parseInt(theme.base00.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIRedColor</key>
  <data>${Buffer.from([parseInt(theme.base08.substring(0, 2), 16), parseInt(theme.base08.substring(2, 4), 16), parseInt(theme.base08.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIGreenColor</key>
  <data>${Buffer.from([parseInt(theme.base0B.substring(0, 2), 16), parseInt(theme.base0B.substring(2, 4), 16), parseInt(theme.base0B.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIYellowColor</key>
  <data>${Buffer.from([parseInt(theme.base0A.substring(0, 2), 16), parseInt(theme.base0A.substring(2, 4), 16), parseInt(theme.base0A.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIBlueColor</key>
  <data>${Buffer.from([parseInt(theme.base0D.substring(0, 2), 16), parseInt(theme.base0D.substring(2, 4), 16), parseInt(theme.base0D.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIMagentaColor</key>
  <data>${Buffer.from([parseInt(theme.base0E.substring(0, 2), 16), parseInt(theme.base0E.substring(2, 4), 16), parseInt(theme.base0E.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSICyanColor</key>
  <data>${Buffer.from([parseInt(theme.base0C.substring(0, 2), 16), parseInt(theme.base0C.substring(2, 4), 16), parseInt(theme.base0C.substring(4, 6), 16)]).toString('base64')}</data>
  <key>ANSIWhiteColor</key>
  <data>${Buffer.from([parseInt(theme.base05.substring(0, 2), 16), parseInt(theme.base05.substring(2, 4), 16), parseInt(theme.base05.substring(4, 6), 16)]).toString('base64')}</data>
</dict>
</plist>
`;
}

// Main generation function
function generateAllThemes() {
  const outputDir = path.join(__dirname, '..', 'src-tauri', 'themes');
  
  // Create directories
  const platforms = ['vscode', 'kiro', 'iterm2', 'warp', 'kitty', 'hyper', 'terminal'];
  platforms.forEach(platform => {
    const dir = path.join(outputDir, platform);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  let fileCount = 0;
  
  // Generate themes for each color scheme
  Object.entries(colors).forEach(([themeId, theme]) => {
    // VS Code
    const vscodeTheme = generateVSCodeTheme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'vscode', `${themeId}.json`),
      JSON.stringify(vscodeTheme, null, 2)
    );
    fileCount++;
    
    // Kiro (same as VS Code)
    fs.writeFileSync(
      path.join(outputDir, 'kiro', `${themeId}.json`),
      JSON.stringify(vscodeTheme, null, 2)
    );
    fileCount++;
    
    // iTerm2
    const iterm2Theme = generateITerm2Theme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'iterm2', `${themeId}.json`),
      JSON.stringify(iterm2Theme, null, 2)
    );
    fileCount++;
    
    // Warp
    const warpTheme = generateWarpTheme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'warp', `${themeId}.yaml`),
      warpTheme
    );
    fileCount++;
    
    // Kitty
    const kittyTheme = generateKittyTheme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'kitty', `${themeId}.conf`),
      kittyTheme
    );
    fileCount++;
    
    // Hyper
    const hyperTheme = generateHyperTheme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'hyper', `${themeId}.js`),
      hyperTheme
    );
    fileCount++;
    
    // Terminal
    const terminalTheme = generateTerminalTheme(themeId, theme);
    fs.writeFileSync(
      path.join(outputDir, 'terminal', `${themeId}.terminal`),
      terminalTheme
    );
    fileCount++;
  });
  
  console.log(`✅ Generated ${fileCount} theme preset files!`);
  console.log(`   ${Object.keys(colors).length} themes × ${platforms.length} platforms = ${fileCount} files`);
  console.log(`   Output: ${outputDir}`);
}

// Run generation
generateAllThemes();

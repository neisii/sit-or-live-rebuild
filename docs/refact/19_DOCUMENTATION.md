# 19_DOCUMENTATION

## Purpose

Complete user-facing documentation including README, user guides, API documentation, and troubleshooting guides.

## Prerequisites

- Project deployed
- All features tested
- Screenshots captured

## Documentation Structure

```
Documentation:
├── README.md              # Project overview
├── docs/
│   ├── USER_GUIDE.md     # End-user guide
│   ├── SETUP.md          # Development setup
│   ├── API.md            # API documentation
│   └── TROUBLESHOOTING.md # Common issues
└── .kiro/
    └── README.md         # Kiro integration guide
```

## 1. README.md (Project Root)

**File**: `README.md`

```markdown
# 🧟 Sit or Live

> Weather-based theme changer + Developer health manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)](https://tauri.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

**Built for Kiroween Hackathon 2025** | **Category: Frankenstein**

## 🎯 What is Sit or Live?

Sit or Live automatically changes your IDE theme based on weather and monitors your health to prevent "zombification" from sitting too long.

**Key Features**:
- 🌦️ **Weather-based themes**: 6 Halloween themes that change with weather
- 💪 **Health monitoring**: Zombie warnings after 30 min idle
- 👁️ **Eye health**: 20-20-20 rule reminders
- 🎨 **IDE/Terminal integration**: 7 platforms supported
- 🌍 **Global dashboard**: Real-time statistics worldwide
- 💬 **Discord notifications**: Stay informed

## 🚀 Quick Start

### Desktop App

**Download**:
- [macOS (Intel/Apple Silicon)](https://github.com/neisii/sit-or-live/releases/latest/download/sit-or-live_0.1.0_x64.dmg)
- [Windows](https://github.com/neisii/sit-or-live/releases/latest/download/sit-or-live_0.1.0_x64_en-US.msi)
- [Linux (deb)](https://github.com/neisii/sit-or-live/releases/latest/download/sit-or-live_0.1.0_amd64.deb)
- [Linux (AppImage)](https://github.com/neisii/sit-or-live/releases/latest/download/sit-or-live_0.1.0_amd64.AppImage)

**Install**:
```bash
# macOS
open sit-or-live_0.1.0_x64.dmg

# Windows
sit-or-live_0.1.0_x64_en-US.msi

# Linux (deb)
sudo dpkg -i sit-or-live_0.1.0_amd64.deb

# Linux (AppImage)
chmod +x sit-or-live_0.1.0_amd64.AppImage
./sit-or-live_0.1.0_amd64.AppImage
```

### Web Dashboard

Visit: **https://sit-or-live.vercel.app**

## 📸 Screenshots

### Desktop App
![Desktop App](docs/screenshots/desktop-app.png)

### Web Dashboard
![Web Dashboard](docs/screenshots/web-dashboard.png)

### Themes
| Daylight Survivor | Vampire Night | Silent Hill |
|-------------------|---------------|-------------|
| ![](docs/screenshots/theme-daylight.png) | ![](docs/screenshots/theme-vampire.png) | ![](docs/screenshots/theme-silent.png) |

## 🎨 Themes

| Weather | Theme | Description |
|---------|-------|-------------|
| ☀️ Clear | Daylight Survivor | Bright, warm colors |
| ☁️ Cloudy | Vampire Night | Dark, mysterious |
| 🌫️ Foggy | Silent Hill | Gray, eerie |
| 🌧️ Rainy | Rainy Cemetery | Blue, melancholic |
| ❄️ Snowy | Frozen Dead | Icy, cold |
| ⛈️ Stormy | Frankenstein Lab | Purple, electric |

## 🛠️ Supported Platforms

### IDEs
- VS Code
- Kiro IDE

### Terminals
- iTerm2 (macOS)
- Warp
- Kitty
- Hyper
- macOS Terminal

### Operating Systems
- macOS 10.15+
- Windows 10+
- Linux (Ubuntu, Debian, Fedora)

## 🔧 Development

### Prerequisites
- Node.js 20.11.0
- Rust 1.77.2
- Tauri CLI 2.1.0

### Setup
```bash
# Clone repository
git clone https://github.com/neisii/sit-or-live.git
cd sit-or-live

# Install dependencies
npm install

# Run development server
npm run tauri:dev

# Build for production
npm run tauri:build
```

### Web Dashboard
```bash
cd web-dashboard
npm install
npm run dev
```

See [SETUP.md](docs/SETUP.md) for detailed instructions.

## 🎯 Kiro Integration

This project showcases Kiro's capabilities:

### Hooks
- **Weather Check**: Auto-check weather every 30 minutes
- **Health Monitor**: Eye health reminders every 20 minutes
- **Session Start**: Launch app reminder

### MCP Servers
- **Weather API**: Open-Meteo integration
- **Discord Webhook**: Notification system

### Steering
- **Project Context**: AI understands project structure
- **User Config**: Personalized preferences

See [.kiro/README.md](.kiro/README.md) for details.

## 📊 Architecture

```
Desktop App (Tauri)
├── Frontend: React + TypeScript
├── Backend: Rust
└── Features:
    ├── Weather API integration
    ├── Health monitoring
    ├── Theme management
    └── Analytics reporting

Web Dashboard (Next.js)
├── Real-time statistics
├── Activity heatmap
├── Interactive demo
└── Supabase integration

Database (Supabase)
├── PostgreSQL
├── Realtime WebSocket
└── Anonymous analytics
```

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏆 Hackathon

**Kiroween 2025** | **Category: Frankenstein**

This project demonstrates:
- Creative technology combination
- Practical developer tool
- Kiro IDE integration
- Open-source contribution

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Desktop app framework
- [Open-Meteo](https://open-meteo.com/) - Weather API
- [Supabase](https://supabase.com/) - Database & Realtime
- [Kiro IDE](https://kiro.ai/) - AI-powered development

## 📧 Contact

- GitHub: [@neisii](https://github.com/neisii)
- Project: [sit-or-live](https://github.com/neisii/sit-or-live)
- Dashboard: [sit-or-live.vercel.app](https://sit-or-live.vercel.app)

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=neisii/sit-or-live&type=Date)](https://star-history.com/#neisii/sit-or-live&Date)

---

**Made with ❤️ for developers who sit too much**
```

## 2. User Guide

**File**: `docs/USER_GUIDE.md`

```markdown
# Sit or Live - User Guide

## Getting Started

### First Launch

1. **Download and install** the app for your platform
2. **Launch** the application
3. **Welcome tooltip** appears - click "Got it!"
4. **Search for your city** in the location search
5. **Select your location** from results
6. **Weather loads** and theme applies automatically

### Interface Overview

```
┌─────────────────────────────────┐
│ 🧟 Sit or Live                  │ ← Header
│ Sit or die trying!              │
│                                 │
│ ⚙️ App Settings                 │ ← Settings popup
├─────────────────────────────────┤
│ 📍 Location Search              │ ← Left column
│ [Search box]                    │
│                                 │
│ 🌦️ Weather                      │
│ Temperature: 15°C               │
│ Condition: Rainy 🌧️            │
│ Theme: Rainy Cemetery           │
├─────────────────────────────────┤
│ 💪 Health Monitor               │ ← Right column
│ Activity: 🟢 Active             │
│ Work time: 15m 30s              │
│ Eye strain: 😊 Low              │
│ Zombie warnings: 0              │
└─────────────────────────────────┘
```

## Features

### 1. Weather-Based Themes

**How it works**:
- App checks weather for your location
- Automatically selects matching theme
- Updates IDE/Terminal if configured
- Changes system dark mode

**Themes**:
- ☀️ **Daylight Survivor**: Clear weather
- ☁️ **Vampire Night**: Cloudy
- 🌫️ **Silent Hill**: Foggy
- 🌧️ **Rainy Cemetery**: Rainy
- ❄️ **Frozen Dead**: Snowy
- ⛈️ **Frankenstein Lab**: Stormy

### 2. Health Monitoring

**Zombie Warning**:
- Triggers after 30 minutes of inactivity
- Shows zombie emoji and message
- Sends Discord notification (if enabled)
- Click "I'm alive!" to dismiss

**Eye Health (20-20-20 Rule)**:
- Work for 20 minutes
- Take 20-second break
- Look 20 feet (6m) away
- Auto-reminder with countdown

**Activity Tracking**:
- Monitors keyboard/mouse activity
- Shows activity intensity (0-100%)
- Displays work duration
- Calculates eye strain level

### 3. Settings

**App Settings** (⚙️ button):
- **Language**: English or Korean
- **Always on Top**: Keep window visible
- **IDE**: VS Code or Kiro
- **Terminal**: iTerm2, Warp, Kitty, Hyper, Terminal
- **Discord**: Enable notifications + webhook URL

**Health Settings** (💪 Settings button):
- **Zombie Warning Time**: 1-60 minutes
- **Enable Warnings**: On/Off
- **Eye Health**: Enable/Disable
- **Work Duration**: 10-60 minutes
- **Break Reminder**: On/Off

### 4. IDE/Terminal Integration

**Setup**:
1. Open App Settings (⚙️)
2. Select your IDE (VS Code or Kiro)
3. Select your Terminal
4. Change location to trigger theme
5. **Reload IDE/Terminal** to see changes

**Manual Reload**:
- **VS Code**: Cmd+R (Mac) or Ctrl+R (Windows)
- **Kiro**: Cmd+Shift+R
- **iTerm2**: Select "sit-or-live" profile
- **Other terminals**: Restart terminal

### 5. Discord Notifications

**Setup**:
1. Create Discord webhook:
   - Server Settings → Integrations → Webhooks
   - Create Webhook → Copy URL
2. Open App Settings
3. Enable Discord Notifications
4. Paste webhook URL
5. Click "Test Webhook"

**Notifications**:
- Theme changes
- Zombie warnings
- Eye break reminders

## Tips & Tricks

### Productivity

1. **Set realistic thresholds**
   - Start with 30-minute zombie warning
   - Adjust based on your work style

2. **Use eye health feature**
   - Enable 20-20-20 rule
   - Take breaks seriously
   - Your eyes will thank you

3. **Configure IDE themes**
   - Automatic theme switching
   - No manual changes needed
   - Consistent across tools

### Customization

1. **Favorite locations**
   - Search once, saves automatically
   - Quick location switching
   - Multiple locations supported

2. **Language preference**
   - English or Korean
   - Persists across sessions
   - UI updates immediately

3. **Window behavior**
   - Always on top for visibility
   - Resize as needed
   - Minimize to tray (coming soon)

## Troubleshooting

### App won't launch

**macOS**:
- Right-click → Open (first time)
- System Preferences → Security → Allow

**Windows**:
- Windows Defender may block
- Click "More info" → "Run anyway"

**Linux**:
- Check permissions: `chmod +x sit-or-live`
- Install dependencies: `sudo apt install libwebkit2gtk-4.0-37`

### Weather not loading

1. Check internet connection
2. Try different location
3. Wait 30 seconds and retry
4. Check firewall settings

### Theme not changing

1. Verify IDE/Terminal selected
2. Check theme files exist
3. Reload IDE/Terminal manually
4. Check logs for errors

### Health monitoring not working

1. Check settings are enabled
2. Verify thresholds are reasonable
3. Move mouse/keyboard to test
4. Restart app if needed

## FAQ

**Q: Does it work offline?**  
A: Partially. Cached weather works, but new locations require internet.

**Q: Is my data private?**  
A: Yes! Personal data stays local. Only anonymous city-level statistics are shared.

**Q: Can I use custom themes?**  
A: Not yet, but it's planned for future versions.

**Q: Does it drain battery?**  
A: No. Very lightweight (~10-20MB RAM, minimal CPU).

**Q: Can I disable features?**  
A: Yes. All features can be toggled in settings.

## Support

- **Issues**: [GitHub Issues](https://github.com/neisii/sit-or-live/issues)
- **Discussions**: [GitHub Discussions](https://github.com/neisii/sit-or-live/discussions)
- **Email**: support@sit-or-live.com

## Updates

App checks for updates automatically. When available:
1. Notification appears
2. Click "Update"
3. Download and install
4. Restart app

---

**Happy coding, stay healthy! 🧟💪**
```

## 3. API Documentation

**File**: `docs/API.md`

```markdown
# API Documentation

## Overview

Sit or Live uses several APIs for weather, location, and analytics.

## External APIs

### 1. Open-Meteo Weather API

**Base URL**: `https://api.open-meteo.com/v1/forecast`

**Endpoint**: Get Current Weather

```http
GET /v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weathercode&timezone=auto
```

**Response**:
```json
{
  "current": {
    "temperature_2m": 15.2,
    "weathercode": 61,
    "time": "2025-11-23T14:30"
  }
}
```

### 2. Open-Meteo Geocoding API

**Base URL**: `https://geocoding-api.open-meteo.com/v1/search`

**Endpoint**: Search Cities

```http
GET /v1/search?name={city}&count=10&language=en
```

**Response**:
```json
{
  "results": [
    {
      "id": 1835848,
      "name": "Seoul",
      "latitude": 37.566,
      "longitude": 126.9784,
      "country": "South Korea"
    }
  ]
}
```

## Internal APIs

### Tauri Commands

All commands are invoked from frontend via `@tauri-apps/api/core`:

```typescript
import { invoke } from '@tauri-apps/api/core';

// Get idle time
const idleSeconds = await invoke<number>('get_idle_time');

// Set dark mode
await invoke('set_dark_mode', { enabled: true });

// Apply theme
await invoke('apply_theme', {
  themeName: 'daylight-survivor',
  ide: 'vscode',
  terminal: 'iterm2'
});

// Report analytics
await invoke('report_theme_change', {
  themeName: 'Daylight Survivor',
  city: 'Seoul',
  country: 'South Korea',
  weatherCode: 0
});
```

### Supabase API

**Base URL**: `https://your-project.supabase.co/rest/v1`

**Get Theme Statistics**:
```http
GET /theme_usage?select=*&order=count.desc
Authorization: Bearer {anon_key}
```

**Upsert Theme Usage**:
```http
POST /rpc/upsert_theme_usage
Content-Type: application/json
Authorization: Bearer {anon_key}

{
  "p_theme_name": "Daylight Survivor",
  "p_city": "Seoul",
  "p_country": "South Korea",
  "p_weather_code": 0
}
```

## Rate Limits

| API | Limit | Notes |
|-----|-------|-------|
| Open-Meteo | Unlimited | Free tier |
| Supabase | 500 req/s | Free tier |
| Discord | 30 req/min | Per webhook |

## Error Handling

All APIs return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limited
- `500 Internal Server Error`: Server error

---

For more details, see source code in `src/services/`.
```

## Verification

```bash
# Check README renders correctly
# GitHub → Repository → README.md should display properly

# Check all links work
# Click each link in README

# Verify screenshots exist
ls docs/screenshots/
# Expected: desktop-app.png, web-dashboard.png, theme-*.png

# Test documentation locally
# Open README.md in Markdown viewer
```

## Next Steps

Proceed to `20_VERIFICATION_CHECKLIST.md` for final quality gates.

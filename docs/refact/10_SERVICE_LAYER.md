# 10_SERVICE_LAYER

## Purpose

Complete implementation of all service layer files containing business logic. These services handle weather, themes, health monitoring, analytics, and more.

## Prerequisites

- TypeScript knowledge
- Async/await patterns
- Browser APIs (localStorage, sessionStorage)
- Tauri API basics

## Service Architecture

```
src/services/
├── weatherService.ts      # Weather API integration
├── themeService.ts        # Theme management
├── healthService.ts       # Health monitoring
├── eyeHealthService.ts    # Eye health (20-20-20)
├── timerService.ts        # Work timer (Rust/JS)
├── analyticsService.ts    # Supabase analytics
└── discordService.ts      # Discord notifications

src/utils/
├── locationService.ts     # Location search
├── logger.ts              # Frontend logging
└── exportLogs.ts          # Log export
```

## Complete Service Implementations

### 1. weatherService.ts

**Location**: `src/services/weatherService.ts`

**Purpose**: Fetch weather data and map to themes

**Complete Implementation**:
```typescript
import { Location } from '../utils/locationService';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  theme: string;
  timestamp: string;
}

export interface WeatherResponse {
  current: {
    temperature_2m: number;
    weathercode: number;
    time: string;
  };
}

export const mapWeatherToTheme = (weatherCode: number): { theme: string; description: string } => {
  if (weatherCode === 0) {
    return { theme: 'Daylight Survivor', description: 'Clear ☀️' };
  }
  
  if (weatherCode >= 1 && weatherCode <= 3) {
    return { theme: 'Vampire Night', description: 'Cloudy ☁️' };
  }
  
  if (weatherCode >= 45 && weatherCode <= 48) {
    return { theme: 'Silent Hill', description: 'Foggy 🌫️' };
  }
  
  if (weatherCode >= 51 && weatherCode <= 67) {
    return { theme: 'Rainy Cemetery', description: 'Rainy 🌧️' };
  }
  
  if (weatherCode >= 71 && weatherCode <= 77) {
    return { theme: 'Frozen Dead', description: 'Snowy ❄️' };
  }
  
  if (weatherCode >= 80 && weatherCode <= 99) {
    return { theme: 'Frankenstein Lab', description: 'Stormy ⛈️' };
  }
  
  return { theme: 'Daylight Survivor', description: 'Unknown' };
};

export const fetchWeather = async (location: Location): Promise<WeatherData> => {
  const { latitude, longitude } = location;
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode&timezone=auto`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: WeatherResponse = await response.json();
    const { theme, description } = mapWeatherToTheme(data.current.weathercode);
    
    return {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weathercode,
      weatherDescription: description,
      theme,
      timestamp: data.current.time,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
};

export const getCachedWeather = (): WeatherData | null => {
  try {
    const cached = sessionStorage.getItem('cachedWeather');
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    
    const cacheTime = new Date(data.timestamp).getTime();
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (now - cacheTime < thirtyMinutes) {
      return data;
    }
    
    return null;
  } catch {
    return null;
  }
};

export const cacheWeather = (weather: WeatherData): void => {
  try {
    sessionStorage.setItem('cachedWeather', JSON.stringify(weather));
  } catch (error) {
    console.error('Failed to cache weather:', error);
  }
};

export const getWeather = async (location: Location, forceRefresh = false): Promise<WeatherData> => {
  if (!forceRefresh) {
    const cached = getCachedWeather();
    if (cached) {
      return cached;
    }
  }
  
  const weather = await fetchWeather(location);
  cacheWeather(weather);
  
  return weather;
};
```

### 2. themeService.ts

**Location**: `src/services/themeService.ts`

**Purpose**: Apply themes to app, system, IDE, and terminal

**Complete Implementation**:
```typescript
import { invoke } from '@tauri-apps/api/core';

export type ThemeName = 
  | 'Daylight Survivor'
  | 'Vampire Night'
  | 'Silent Hill'
  | 'Rainy Cemetery'
  | 'Frozen Dead'
  | 'Frankenstein Lab';

export interface ThemeConfig {
  name: ThemeName;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const themes: Record<ThemeName, ThemeConfig> = {
  'Daylight Survivor': {
    name: 'Daylight Survivor',
    isDark: false,
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF6347',
      background: '#FFF8DC',
    },
  },
  'Vampire Night': {
    name: 'Vampire Night',
    isDark: true,
    colors: {
      primary: '#DC143C',
      secondary: '#8B0000',
      accent: '#9400D3',
      background: '#0D0D0D',
    },
  },
  'Silent Hill': {
    name: 'Silent Hill',
    isDark: true,
    colors: {
      primary: '#696969',
      secondary: '#808080',
      accent: '#A9A9A9',
      background: '#2F4F4F',
    },
  },
  'Rainy Cemetery': {
    name: 'Rainy Cemetery',
    isDark: true,
    colors: {
      primary: '#4682B4',
      secondary: '#5F9EA0',
      accent: '#6495ED',
      background: '#1C1C2E',
    },
  },
  'Frozen Dead': {
    name: 'Frozen Dead',
    isDark: true,
    colors: {
      primary: '#B0E0E6',
      secondary: '#ADD8E6',
      accent: '#87CEEB',
      background: '#1A1A2E',
    },
  },
  'Frankenstein Lab': {
    name: 'Frankenstein Lab',
    isDark: true,
    colors: {
      primary: '#9370DB',
      secondary: '#8A2BE2',
      accent: '#FF00FF',
      background: '#0F0F1E',
    },
  },
};

export const setSystemDarkMode = async (enabled: boolean): Promise<void> => {
  try {
    await invoke('set_dark_mode', { enabled });
    console.log(`System dark mode set to: ${enabled}`);
  } catch (error) {
    console.error('Failed to set system dark mode:', error);
    throw error;
  }
};

export const getSystemDarkMode = async (): Promise<boolean> => {
  try {
    const isDark = await invoke<boolean>('get_dark_mode');
    return isDark;
  } catch (error) {
    console.error('Failed to get system dark mode:', error);
    return false;
  }
};

export const applyTheme = async (
  themeName: ThemeName, 
  location?: { name: string; country: string; latitude: number; longitude: number },
  weatherCode?: number
): Promise<void> => {
  const theme = themes[themeName];
  
  // 1. Apply app theme (CSS variables)
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  
  // 2. Set system dark mode
  try {
    await setSystemDarkMode(theme.isDark);
  } catch (error) {
    console.warn('Could not set system dark mode:', error);
  }
  
  // 3. Apply IDE/Terminal theme
  const selectedIDE = localStorage.getItem('selected_ide');
  const selectedTerminal = localStorage.getItem('selected_terminal');
  
  if (selectedIDE || selectedTerminal) {
    try {
      const themeFileName = themeName.toLowerCase().replace(/ /g, '-');
      
      await invoke('apply_theme', {
        themeName: themeFileName,
        ide: selectedIDE || null,
        terminal: selectedTerminal || null
      });
      
      console.log('IDE/Terminal theme applied', { 
        theme: themeName,
        ide: selectedIDE,
        terminal: selectedTerminal 
      });
    } catch (error) {
      console.error('Failed to apply IDE/Terminal theme:', error);
    }
  }
  
  // 4. Save theme
  localStorage.setItem('currentTheme', themeName);
  
  // 5. Report analytics
  if (location && weatherCode !== undefined) {
    try {
      const { reportThemeChange } = await import('./analyticsService');
      await reportThemeChange(themeName, {
        city: location.name,
        country: location.country
      }, weatherCode);
    } catch (error) {
      console.debug('Analytics report skipped:', error);
    }
  }
  
  // 6. Send Discord notification
  try {
    const { sendDiscordNotification } = await import('./discordService');
    const locationStr = location ? `${location.name}, ${location.country}` : '';
    await sendDiscordNotification({
      message: `🎨 테마 변경: ${themeName}`,
      title: '날씨 기반 테마',
      description: locationStr ? `위치: ${locationStr}` : undefined,
      color: 0x5865F2
    });
  } catch (error) {
    console.debug('Discord notification skipped:', error);
  }
};

export const getSavedTheme = (): ThemeName | null => {
  const saved = localStorage.getItem('currentTheme');
  return saved as ThemeName | null;
};

export const loadInitialTheme = async (): Promise<void> => {
  const savedTheme = getSavedTheme();
  if (savedTheme) {
    await applyTheme(savedTheme);
  }
};
```

### 3. healthService.ts

**Location**: `src/services/healthService.ts`

**Purpose**: Monitor user activity and trigger zombie warnings

**Key Functions**:
```typescript
import { invoke } from '@tauri-apps/api/core';

export interface HealthStats {
  idleTime: number;
  sessionStart: number;
  lastActivity: number;
  totalIdleTime: number;
  zombieWarnings: number;
}

export interface HealthSettings {
  zombieThreshold: number;
  checkInterval: number;
  enableWarnings: boolean;
}

const DEFAULT_ZOMBIE_THRESHOLD = 30 * 60; // 30 minutes
const CHECK_INTERVAL = 10 * 1000; // 10 seconds

export const getIdleTime = async (): Promise<number> => {
  try {
    const idleSeconds = await invoke<number>('get_idle_time');
    return idleSeconds;
  } catch (error) {
    console.error('Failed to get idle time:', error);
    return 0;
  }
};

export const startHealthMonitoring = (
  onUpdate: (stats: HealthStats) => void,
  onZombieWarning: () => void
): number => {
  const settings = getHealthSettings();
  
  // Start activity reporting (30 min intervals)
  startActivityReporting();
  
  const checkHealth = async () => {
    const idleSeconds = await getIdleTime();
    const stats = getHealthStats();
    
    stats.idleTime = idleSeconds;
    
    if (idleSeconds < 10) {
      stats.lastActivity = Date.now();
    }
    
    if (settings.enableWarnings && shouldShowZombieWarning(idleSeconds)) {
      const lastWarning = localStorage.getItem('lastZombieWarning');
      const now = Date.now();
      const warningCooldown = settings.zombieThreshold * 1000;
      
      if (!lastWarning || now - parseInt(lastWarning) > warningCooldown) {
        stats.zombieWarnings += 1;
        localStorage.setItem('lastZombieWarning', now.toString());
        
        // Send Discord notification
        (async () => {
          try {
            const { sendDiscordNotification } = await import('./discordService');
            await sendDiscordNotification({
              message: '🧟 좀비 경고!',
              title: '건강 알림',
              description: `${formatTime(idleSeconds)} 동안 활동 없음. 움직이세요!`,
              color: 0xFF0000
            });
          } catch (error) {
            console.debug('Discord notification skipped:', error);
          }
        })();
        
        onZombieWarning();
      }
    }
    
    saveHealthStats(stats);
    onUpdate(stats);
  };
  
  checkHealth();
  return window.setInterval(checkHealth, settings.checkInterval);
};

export const stopHealthMonitoring = (intervalId: number): void => {
  clearInterval(intervalId);
  stopActivityReporting();
};
```

### 4. analyticsService.ts

**Location**: `src/services/analyticsService.ts`

**Purpose**: Report anonymous analytics to Supabase

**Complete Implementation**:
```typescript
import { invoke } from '@tauri-apps/api/core';
import { logger } from '../utils/logger';

export async function reportThemeChange(
  themeName: string,
  location: { city: string; country: string },
  weatherCode: number
): Promise<void> {
  try {
    await invoke('report_theme_change', {
      themeName,
      city: location.city,
      country: location.country,
      weatherCode
    });
    logger.info('Theme change reported to analytics', { 
      theme: themeName, 
      city: location.city 
    });
  } catch (error) {
    logger.error('Failed to report theme change', { error: String(error) });
  }
}

export async function reportActivity(
  location: { city: string; country: string; latitude: number; longitude: number }
): Promise<void> {
  try {
    await invoke('report_activity', {
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude
    });
    logger.info('Activity reported to analytics', { city: location.city });
  } catch (error) {
    logger.error('Failed to report activity', { error: String(error) });
  }
}
```

### 5. discordService.ts

**Location**: `src/services/discordService.ts`

**Purpose**: Send notifications to Discord

**Complete Implementation**:
```typescript
import { invoke } from '@tauri-apps/api/core';

export interface DiscordNotification {
  message: string;
  title?: string;
  description?: string;
  color?: number;
}

export function getDiscordWebhookUrl(): string | null {
  return localStorage.getItem('discordWebhookUrl');
}

export function setDiscordWebhookUrl(url: string): void {
  localStorage.setItem('discordWebhookUrl', url);
}

export function isDiscordEnabled(): boolean {
  return localStorage.getItem('discordEnabled') === 'true';
}

export function setDiscordEnabled(enabled: boolean): void {
  localStorage.setItem('discordEnabled', enabled.toString());
}

export async function sendDiscordNotification(
  notification: DiscordNotification
): Promise<boolean> {
  if (!isDiscordEnabled()) {
    return false;
  }
  
  const webhookUrl = getDiscordWebhookUrl();
  if (!webhookUrl) {
    return false;
  }
  
  try {
    await invoke('send_discord_notification', {
      webhookUrl,
      message: notification.message,
      title: notification.title || null,
      description: notification.description || null,
      color: notification.color || 0x5865F2
    });
    return true;
  } catch (error) {
    console.error('Discord notification failed:', error);
    return false;
  }
}

export async function testDiscordWebhook(): Promise<boolean> {
  return await sendDiscordNotification({
    message: '✅ Discord webhook test successful!',
    title: 'Sit or Live',
    description: 'Your Discord integration is working correctly.',
    color: 0x00FF00
  });
}
```

### 6. logger.ts

**Location**: `src/utils/logger.ts`

**Purpose**: Frontend logging with localStorage persistence

**Complete Implementation**:
```typescript
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private storageKey = 'app_logs';

  private constructor() {
    this.loadLogs();
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load logs:', e);
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        this.logs = this.logs.slice(-250);
        console.warn('Log quota exceeded, cleared old logs');
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (e2) {
          console.error('Failed to save logs after cleanup:', e2);
        }
      } else {
        console.error('Failed to save logs:', e);
      }
    }
  }

  private addLog(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };

    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    console[consoleMethod](`[${level}] ${message}`, data || '');

    this.logs.push(logEntry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (level === 'ERROR' || level === 'WARN') {
      this.saveLogs();
    } else {
      this.debouncedSave();
    }
  }

  private saveTimer: number | null = null;
  private debouncedSave() {
    if (this.saveTimer !== null) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = window.setTimeout(() => {
      this.saveLogs();
      this.saveTimer = null;
    }, 1000);
  }

  info(message: string, data?: any) {
    this.addLog('INFO', message, data);
  }

  error(message: string, data?: any) {
    this.addLog('ERROR', message, data);
  }

  warn(message: string, data?: any) {
    this.addLog('WARN', message, data);
  }

  debug(message: string, data?: any) {
    this.addLog('DEBUG', message, data);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
  }

  exportLogs(): string {
    return this.logs
      .map(log => {
        const dataStr = log.data ? ` | ${JSON.stringify(log.data)}` : '';
        return `[${log.timestamp}] [${log.level}] ${log.message}${dataStr}`;
      })
      .join('\n');
  }
}

export const logger = Logger.getInstance();
```

## Verification

### Service Tests

```bash
# Run service tests
npm test

# Expected: All tests pass

# Test specific service
npm test -- weatherService.test.ts
```

### Integration Test

```typescript
// Test complete flow
import { getWeather } from './services/weatherService';
import { applyTheme } from './services/themeService';
import { reportThemeChange } from './services/analyticsService';

async function testFlow() {
  const location = {
    name: 'Seoul',
    country: 'South Korea',
    latitude: 37.5665,
    longitude: 126.9780
  };
  
  // 1. Get weather
  const weather = await getWeather(location);
  console.log('Weather:', weather);
  
  // 2. Apply theme
  await applyTheme(weather.theme, location, weather.weatherCode);
  console.log('Theme applied');
  
  // 3. Report analytics
  await reportThemeChange(weather.theme, location, weather.weatherCode);
  console.log('Analytics reported');
}
```

## Troubleshooting

### Issue: Tauri invoke fails

**Solution**: Check Rust backend is running and command is registered

### Issue: localStorage quota exceeded

**Solution**: Logger automatically clears old logs

### Issue: Analytics not reporting

**Solution**: Check Supabase credentials in .env

## Next Steps

Proceed to `11_RUST_BACKEND.md` for complete Rust implementation.

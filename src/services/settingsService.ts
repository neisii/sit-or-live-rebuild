import { getCurrentWindow } from '@tauri-apps/api/window';

/**
 * Settings Service
 * Manages application settings and preferences
 */

export interface AppSettings {
  // Theme settings
  selectedIDE: string;
  selectedTerminal: string;
  autoThemeSwitch: boolean;
  
  // Health settings
  enableZombieWarnings: boolean;
  zombieThreshold: number; // minutes
  enableEyeHealth: boolean;
  eyeHealthInterval: number; // minutes
  breakDuration: number; // seconds
  
  // Notification settings
  discordWebhook: string;
  enableDiscordNotifications: boolean;
  
  // UI settings
  alwaysOnTop: boolean;
  language: 'en' | 'ko';
  
  // Location settings
  defaultLocation: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  } | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  selectedIDE: '',
  selectedTerminal: '',
  autoThemeSwitch: true,
  enableZombieWarnings: true,
  zombieThreshold: 30,
  enableEyeHealth: true,
  eyeHealthInterval: 20,
  breakDuration: 20,
  discordWebhook: '',
  enableDiscordNotifications: false,
  alwaysOnTop: false,
  language: 'en',
  defaultLocation: null,
};

const SETTINGS_KEY = 'app_settings';

/**
 * Load settings from localStorage
 */
export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings');
  }
}

/**
 * Update specific setting
 */
export function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): void {
  const settings = loadSettings();
  settings[key] = value;
  saveSettings(settings);
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): void {
  saveSettings(DEFAULT_SETTINGS);
}

/**
 * Set window always on top
 */
export async function setAlwaysOnTop(enabled: boolean): Promise<void> {
  try {
    const window = getCurrentWindow();
    await window.setAlwaysOnTop(enabled);
    updateSetting('alwaysOnTop', enabled);
  } catch (error) {
    console.error('Failed to set always on top:', error);
    throw new Error('Failed to set always on top');
  }
}

/**
 * Get always on top status
 */
export async function getAlwaysOnTop(): Promise<boolean> {
  try {
    const settings = loadSettings();
    return settings.alwaysOnTop;
  } catch (error) {
    console.error('Failed to get always on top status:', error);
    return false;
  }
}

/**
 * Export settings to JSON file
 */
export function exportSettings(): void {
  const settings = loadSettings();
  const json = JSON.stringify(settings, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sit-or-live-settings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import settings from JSON file
 */
export async function importSettings(file: File): Promise<void> {
  try {
    const text = await file.text();
    const settings = JSON.parse(text);
    
    // Validate settings
    if (typeof settings !== 'object') {
      throw new Error('Invalid settings file');
    }
    
    // Merge with defaults to ensure all keys exist
    const merged = { ...DEFAULT_SETTINGS, ...settings };
    saveSettings(merged);
  } catch (error) {
    console.error('Failed to import settings:', error);
    throw new Error('Failed to import settings');
  }
}

/**
 * Validate Discord webhook URL
 */
export function validateDiscordWebhook(url: string): boolean {
  if (!url) return true; // Empty is valid (disabled)
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'discord.com' && parsed.pathname.includes('/api/webhooks/');
  } catch {
    return false;
  }
}

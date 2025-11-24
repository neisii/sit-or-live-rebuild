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
  _location?: { name: string; country: string; latitude: number; longitude: number },
  _weatherCode?: number
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
  
  // 3. Apply IDE/Terminal theme (if selected)
  const selectedIDE = localStorage.getItem('selected_ide');
  const selectedTerminal = localStorage.getItem('selected_terminal');
  
  if (selectedIDE || selectedTerminal) {
    try {
      await invoke('apply_theme', {
        themeName: themeName,
        ide: selectedIDE || '',
        terminal: selectedTerminal || ''
      });
      console.log(`Applied theme to IDE: ${selectedIDE}, Terminal: ${selectedTerminal}`);
    } catch (error) {
      console.warn('Could not apply IDE/Terminal theme:', error);
    }
  }
  
  // 4. Save current theme
  localStorage.setItem('currentTheme', themeName);
  
  console.log(`Theme applied: ${themeName}`);
};

export const loadInitialTheme = async (): Promise<void> => {
  const savedTheme = localStorage.getItem('currentTheme') as ThemeName | null;
  
  if (savedTheme && themes[savedTheme]) {
    await applyTheme(savedTheme);
  } else {
    // Default theme
    await applyTheme('Daylight Survivor');
  }
};

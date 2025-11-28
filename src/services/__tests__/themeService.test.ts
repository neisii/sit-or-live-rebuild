import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyTheme, loadInitialTheme, ThemeName } from '../themeService';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}));

describe('themeService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('loadInitialTheme', () => {
    it('should load saved theme from localStorage', () => {
      localStorage.setItem('current_theme', 'Vampire Night');
      loadInitialTheme();
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--bg-primary')).toBeTruthy();
    });

    it('should use default theme if none saved', () => {
      loadInitialTheme();
      
      const savedTheme = localStorage.getItem('current_theme');
      expect(savedTheme).toBeTruthy();
    });
  });

  describe('applyTheme', () => {
    it('should apply theme CSS variables', async () => {
      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.9780
      };

      await applyTheme('Daylight Survivor', location, 0);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--bg-primary')).toBeTruthy();
    });

    it('should save theme to localStorage', async () => {
      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.9780
      };

      await applyTheme('Silent Hill', location, 45);
      
      expect(localStorage.getItem('current_theme')).toBe('Silent Hill');
    });
  });
});

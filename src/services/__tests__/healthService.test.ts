import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatTime, getHealthSettings, updateHealthSettings } from '../healthService';

describe('healthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('0s');
      expect(formatTime(45)).toBe('45s');
      expect(formatTime(59)).toBe('59s');
    });

    it('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('1m 0s');
      expect(formatTime(125)).toBe('2m 5s');
      expect(formatTime(3599)).toBe('59m 59s');
    });

    it('should format hours correctly', () => {
      expect(formatTime(3600)).toBe('1h 0m');
      expect(formatTime(3661)).toBe('1h 1m');
      expect(formatTime(7325)).toBe('2h 2m');
    });
  });

  describe('getHealthSettings', () => {
    it('should return default settings', () => {
      const settings = getHealthSettings();
      
      expect(settings.enableWarnings).toBe(true);
      expect(settings.zombieThreshold).toBe(1800);
      expect(settings.checkInterval).toBe(1000);
    });

    it('should load saved settings', () => {
      const customSettings = {
        enableWarnings: false,
        zombieThreshold: 3600,
        checkInterval: 2000
      };
      localStorage.setItem('health_settings', JSON.stringify(customSettings));
      
      const settings = getHealthSettings();
      expect(settings).toEqual(customSettings);
    });
  });

  describe('updateHealthSettings', () => {
    it('should save settings to localStorage', () => {
      const newSettings = {
        enableWarnings: false,
        zombieThreshold: 900,
        checkInterval: 500
      };
      
      updateHealthSettings(newSettings);
      
      const saved = JSON.parse(localStorage.getItem('health_settings') || '{}');
      expect(saved).toEqual(newSettings);
    });
  });
});

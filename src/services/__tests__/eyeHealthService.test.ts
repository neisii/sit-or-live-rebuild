import { describe, it, expect, beforeEach } from 'vitest';
import { getEyeHealthSettings, updateEyeHealthSettings, getRandomHalloweenCharacter } from '../eyeHealthService';

describe('eyeHealthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getEyeHealthSettings', () => {
    it('should return default settings', () => {
      const settings = getEyeHealthSettings();
      
      expect(settings.enableEyeHealth).toBe(true);
      expect(settings.workDuration).toBe(1200); // 20 minutes
      expect(settings.breakDuration).toBe(20); // 20 seconds
    });

    it('should load saved settings', () => {
      const customSettings = {
        enableEyeHealth: false,
        workDuration: 600,
        breakDuration: 30
      };
      localStorage.setItem('eye_health_settings', JSON.stringify(customSettings));
      
      const settings = getEyeHealthSettings();
      expect(settings).toEqual(customSettings);
    });
  });

  describe('updateEyeHealthSettings', () => {
    it('should save settings to localStorage', () => {
      const newSettings = {
        enableEyeHealth: true,
        workDuration: 900,
        breakDuration: 15
      };
      
      updateEyeHealthSettings(newSettings);
      
      const saved = JSON.parse(localStorage.getItem('eye_health_settings') || '{}');
      expect(saved).toEqual(newSettings);
    });
  });

  describe('getRandomHalloweenCharacter', () => {
    it('should return a character with required properties', () => {
      const character = getRandomHalloweenCharacter();
      
      expect(character).toHaveProperty('emoji');
      expect(character).toHaveProperty('title');
      expect(character).toHaveProperty('message');
      expect(typeof character.emoji).toBe('string');
      expect(typeof character.title).toBe('string');
      expect(typeof character.message).toBe('string');
    });

    it('should return different characters on multiple calls', () => {
      const characters = new Set();
      for (let i = 0; i < 20; i++) {
        characters.add(getRandomHalloweenCharacter().emoji);
      }
      
      // Should have at least 2 different characters in 20 calls
      expect(characters.size).toBeGreaterThan(1);
    });
  });
});

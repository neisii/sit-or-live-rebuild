import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeather, getWeatherDescription, mapWeatherToTheme } from '../weatherService';

// Mock fetch
global.fetch = vi.fn();

describe('weatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache
    sessionStorage.clear();
  });

  describe('mapWeatherToTheme', () => {
    it('should map clear weather to Daylight Survivor', () => {
      expect(mapWeatherToTheme(0)).toBe('Daylight Survivor');
      expect(mapWeatherToTheme(1)).toBe('Daylight Survivor');
    });

    it('should map cloudy weather to Vampire Night', () => {
      expect(mapWeatherToTheme(2)).toBe('Vampire Night');
      expect(mapWeatherToTheme(3)).toBe('Vampire Night');
    });

    it('should map fog to Silent Hill', () => {
      expect(mapWeatherToTheme(45)).toBe('Silent Hill');
      expect(mapWeatherToTheme(48)).toBe('Silent Hill');
    });

    it('should map rain to Rainy Cemetery', () => {
      expect(mapWeatherToTheme(61)).toBe('Rainy Cemetery');
      expect(mapWeatherToTheme(63)).toBe('Rainy Cemetery');
    });

    it('should map snow to Frozen Dead', () => {
      expect(mapWeatherToTheme(71)).toBe('Frozen Dead');
      expect(mapWeatherToTheme(73)).toBe('Frozen Dead');
    });

    it('should map thunderstorm to Frankenstein Lab', () => {
      expect(mapWeatherToTheme(95)).toBe('Frankenstein Lab');
      expect(mapWeatherToTheme(99)).toBe('Frankenstein Lab');
    });

    it('should default to Vampire Night for unknown codes', () => {
      expect(mapWeatherToTheme(999)).toBe('Vampire Night');
    });
  });

  describe('getWeatherDescription', () => {
    it('should return correct descriptions', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky');
      expect(getWeatherDescription(61)).toBe('Slight rain');
      expect(getWeatherDescription(95)).toBe('Thunderstorm');
    });

    it('should return Unknown for invalid codes', () => {
      expect(getWeatherDescription(999)).toBe('Unknown');
    });
  });

  describe('getWeather', () => {
    it('should fetch weather and return data', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          weather_code: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978,
      };

      const result = await getWeather(location);

      expect(result).toEqual({
        temperature: 20,
        weatherCode: 0,
        weatherDescription: 'Clear sky',
        theme: 'Daylight Survivor',
        timestamp: expect.any(String),
      });
    });

    it('should use cache for repeated requests', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          weather_code: 0,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978,
      };

      // First call
      await getWeather(location);
      
      // Second call should use cache
      await getWeather(location);

      // Fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache when force is true', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          weather_code: 0,
        },
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978,
      };

      // First call
      await getWeather(location);
      
      // Second call with force
      await getWeather(location, true);

      // Fetch should be called twice
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error on fetch failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978,
      };

      await expect(getWeather(location)).rejects.toThrow('Failed to fetch weather');
    });
  });
});

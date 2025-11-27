import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchCities,
  getCurrentLocation,
  setCurrentLocation,
  BUILT_IN_CITIES,
} from '../locationService';

// Mock fetch
global.fetch = vi.fn();

describe('locationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('BUILT_IN_CITIES', () => {
    it('should have 30 cities', () => {
      expect(BUILT_IN_CITIES).toHaveLength(30);
    });

    it('should have valid city data', () => {
      BUILT_IN_CITIES.forEach(city => {
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('country');
        expect(city).toHaveProperty('latitude');
        expect(city).toHaveProperty('longitude');
        expect(typeof city.latitude).toBe('number');
        expect(typeof city.longitude).toBe('number');
      });
    });
  });

  describe('getCurrentLocation', () => {
    it('should return null when no location is saved', () => {
      expect(getCurrentLocation()).toBeNull();
    });

    it('should return saved location', () => {
      const location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.978,
      };

      setCurrentLocation(location);
      expect(getCurrentLocation()).toEqual(location);
    });
  });

  describe('setCurrentLocation', () => {
    it('should save location to localStorage', () => {
      const location = {
        name: 'Tokyo',
        country: 'Japan',
        latitude: 35.6762,
        longitude: 139.6503,
      };

      setCurrentLocation(location);
      
      const saved = localStorage.getItem('current_location');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(location);
    });
  });

  describe('searchCities', () => {
    it('should return built-in cities matching query', async () => {
      const results = await searchCities('seoul');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Seoul');
    });

    it('should be case-insensitive', async () => {
      const results = await searchCities('TOKYO');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Tokyo');
    });

    it('should search API when no built-in matches', async () => {
      const mockResponse = {
        results: [
          {
            name: 'TestCity',
            country: 'TestCountry',
            latitude: 10,
            longitude: 20,
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchCities('testcity');
      
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('TestCity');
    });

    it('should deduplicate results', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Seoul',
            country: 'South Korea',
            latitude: 37.5665,
            longitude: 126.978,
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchCities('seoul');
      
      // Should only have one Seoul (built-in, not duplicate from API)
      const seoulResults = results.filter(r => r.name === 'Seoul');
      expect(seoulResults).toHaveLength(1);
    });

    it('should return empty array on API error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const results = await searchCities('unknowncity');
      
      expect(results).toEqual([]);
    });

    it('should limit results to 10', async () => {
      const mockResults = Array.from({ length: 20 }, (_, i) => ({
        name: `City${i}`,
        country: 'Country',
        latitude: i,
        longitude: i,
      }));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: mockResults }),
      });

      const results = await searchCities('city');
      
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });
});

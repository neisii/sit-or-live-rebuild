export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  population?: number;
  feature_code?: string;
}

// 30 major cities built-in for instant selection
export const BUILT_IN_CITIES: Location[] = [
  // Asia (8)
  { name: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 },
  { name: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
  { name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Delhi', country: 'India', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  
  // Europe (8)
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { name: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
  { name: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  
  // Americas (8)
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { name: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { name: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
  { name: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { name: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  
  // Oceania & Africa (6)
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
  { name: 'Auckland', country: 'New Zealand', latitude: -36.8485, longitude: 174.7633 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { name: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
];

export const searchCities = async (query: string): Promise<Location[]> => {
  if (query.length < 2) {
    return [];
  }
  
  // First, search built-in cities
  const builtInResults = BUILT_IN_CITIES.filter(city =>
    city.name.toLowerCase().includes(query.toLowerCase()) ||
    city.country.toLowerCase().includes(query.toLowerCase())
  );
  
  // If we have built-in results, return them
  if (builtInResults.length > 0) {
    return builtInResults.slice(0, 10);
  }
  
  // Otherwise, search via API
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return [];
    }
    
    return data.results.map((result: any) => ({
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      admin1: result.admin1,
      population: result.population,
      feature_code: result.feature_code,
    }));
  } catch (error) {
    console.error('Failed to search cities:', error);
    return [];
  }
};

export const getCurrentLocation = (): Location | null => {
  try {
    const saved = localStorage.getItem('currentLocation');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const setCurrentLocation = (location: Location): void => {
  try {
    localStorage.setItem('currentLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Failed to save location:', error);
  }
};

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

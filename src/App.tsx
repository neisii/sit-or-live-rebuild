import { useState, useEffect } from 'react';
import './App.css';

interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  theme: string;
}

function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default location (Seoul)
  useEffect(() => {
    const defaultLocation: Location = {
      name: 'Seoul',
      country: 'South Korea',
      latitude: 37.5665,
      longitude: 126.9780
    };
    setLocation(defaultLocation);
    loadWeather(defaultLocation);
  }, []);

  const loadWeather = async (loc: Location) => {
    setLoading(true);
    setError('');

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weathercode&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }

      const data = await response.json();
      const weatherCode = data.current.weathercode;
      const theme = mapWeatherToTheme(weatherCode);

      setWeather({
        temperature: data.current.temperature_2m,
        weatherCode,
        weatherDescription: getWeatherDescription(weatherCode),
        theme
      });
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mapWeatherToTheme = (code: number): string => {
    if (code === 0) return 'Daylight Survivor';
    if (code >= 1 && code <= 3) return 'Vampire Night';
    if (code >= 45 && code <= 48) return 'Silent Hill';
    if (code >= 51 && code <= 67) return 'Rainy Cemetery';
    if (code >= 71 && code <= 77) return 'Frozen Dead';
    if (code >= 80 && code <= 99) return 'Frankenstein Lab';
    return 'Daylight Survivor';
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 99) return 'Stormy';
    return 'Clear';
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">🧟 Sit or Live</h1>
        <p className="subtitle">Stay healthy while coding</p>
      </div>

      {loading && (
        <div className="loading">Loading weather...</div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      {location && (
        <div className="section">
          <h2 className="section-title">📍 Location</h2>
          <p>{location.name}, {location.country}</p>
        </div>
      )}

      {weather && (
        <div className="section">
          <div className="weather-display">
            <div className="temperature">{Math.round(weather.temperature)}°C</div>
            <div className="weather-description">{weather.weatherDescription}</div>
            <div className="theme-badge">🎨 {weather.theme}</div>
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">💪 Health Monitoring</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          Health monitoring features will be implemented in the full version.
        </p>
        <div className="stats-grid" style={{ marginTop: '1rem' }}>
          <div className="stat-card">
            <div className="stat-label">Activity</div>
            <div className="stat-value">--</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Work Time</div>
            <div className="stat-value">--</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">ℹ️ About</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          This is a minimal implementation of sit-or-live. The full version includes:
        </p>
        <ul style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Weather-based theme switching (6 themes × 7 platforms)</li>
          <li>Activity monitoring & zombie warnings</li>
          <li>Eye health (20-20-20 rule)</li>
          <li>Discord integration</li>
          <li>Multi-language support</li>
          <li>And 10 more features...</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

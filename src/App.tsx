import { useState, useEffect } from 'react';
import './App.css';
import { Location, getCurrentLocation, setCurrentLocation, searchCities, BUILT_IN_CITIES } from './utils/locationService';
import { getWeather } from './services/weatherService';
import { applyTheme, loadInitialTheme, ThemeName } from './services/themeService';
import { startHealthMonitoring, stopHealthMonitoring, getHealthSettings, formatTime, HealthStats } from './services/healthService';
import { EyeHealthStats } from './services/eyeHealthService';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  theme: string;
  timestamp: string;
}

function App() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showBuiltIn, setShowBuiltIn] = useState(true);
  
  // Health monitoring
  const [healthStats, setHealthStats] = useState<HealthStats | null>(null);
  const [eyeHealthStats] = useState<EyeHealthStats | null>(null);

  // Initial load
  useEffect(() => {
    loadInitialTheme();
    
    const savedLocation = getCurrentLocation();
    if (savedLocation) {
      setLocation(savedLocation);
      loadWeather(savedLocation);
    } else {
      // Default to Seoul
      const defaultLocation: Location = {
        name: 'Seoul',
        country: 'South Korea',
        latitude: 37.5665,
        longitude: 126.9780
      };
      setLocation(defaultLocation);
      setCurrentLocation(defaultLocation);
      loadWeather(defaultLocation);
    }
  }, []);

  // Start health monitoring
  useEffect(() => {
    const settings = getHealthSettings();
    
    const intervalId = startHealthMonitoring(
      (stats) => setHealthStats(stats),
      () => {
        // Zombie warning - simplified for now
        if (settings.enableWarnings) {
          console.log('Zombie warning: Move!');
        }
      }
    );
    
    return () => {
      if (intervalId) {
        stopHealthMonitoring(intervalId);
      }
    };
  }, []);

  const loadWeather = async (loc: Location) => {
    setLoading(true);
    setError('');

    try {
      const weatherData = await getWeather(loc, true);
      setWeather(weatherData);
      
      // Apply theme
      await applyTheme(
        weatherData.theme as ThemeName,
        {
          name: loc.name,
          country: loc.country,
          latitude: loc.latitude,
          longitude: loc.longitude
        },
        weatherData.weatherCode
      );
    } catch (err) {
      setError('Failed to load weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    setShowBuiltIn(false);
    const results = await searchCities(searchQuery);
    setSearchResults(results);
  };

  const handleSelectLocation = (loc: Location) => {
    setLocation(loc);
    setCurrentLocation(loc);
    setSearchResults([]);
    setSearchQuery('');
    setShowBuiltIn(true);
    loadWeather(loc);
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

      {/* Location Search */}
      <div className="section">
        <h2 className="section-title">📍 Location</h2>
        {location && (
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>{location.name}, {location.country}</strong>
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="button" onClick={handleSearch}>
            Search
          </button>
        </div>
        
        {/* Built-in cities */}
        {showBuiltIn && searchResults.length === 0 && (
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
              Quick select:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {BUILT_IN_CITIES.slice(0, 8).map((city) => (
                <button
                  key={`${city.name}-${city.country}`}
                  className="button"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => handleSelectLocation(city)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.5rem',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  marginBottom: '0.25rem',
                  borderRadius: '4px',
                }}
                onClick={() => handleSelectLocation(result)}
              >
                <div style={{ fontSize: '0.875rem' }}>
                  {result.name}, {result.country}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weather Display */}
      {weather && (
        <div className="section">
          <div className="weather-display">
            <div className="temperature">{Math.round(weather.temperature)}°C</div>
            <div className="weather-description">{weather.weatherDescription}</div>
            <div className="theme-badge">🎨 {weather.theme}</div>
          </div>
        </div>
      )}

      {/* Health Monitoring */}
      <div className="section">
        <h2 className="section-title">💪 Health Monitoring</h2>
        {healthStats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Idle Time</div>
              <div className="stat-value">{formatTime(healthStats.idleTime)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Activity</div>
              <div className="stat-value">{Math.round(healthStats.activityLevel * 100)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Session</div>
              <div className="stat-value">{formatTime(healthStats.sessionDuration)}</div>
            </div>
            {eyeHealthStats && (
              <div className="stat-card">
                <div className="stat-label">Eye Strain</div>
                <div className="stat-value">{Math.round(eyeHealthStats.eyeStrain)}%</div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
            Health monitoring starting...
          </p>
        )}
      </div>

      {/* About */}
      <div className="section">
        <h2 className="section-title">ℹ️ About</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>
          This is an enhanced implementation with core features. Full version includes:
        </p>
        <ul style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>✅ Weather-based theme switching</li>
          <li>✅ Activity monitoring</li>
          <li>✅ Location search (30 built-in cities)</li>
          <li>⏳ Zombie warnings (coming soon)</li>
          <li>⏳ Eye health (20-20-20 rule)</li>
          <li>⏳ Discord integration</li>
          <li>⏳ Multi-language support</li>
          <li>⏳ And 8 more features...</li>
        </ul>
      </div>
    </div>
  );
}

export default App;

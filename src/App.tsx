import { useState, useEffect } from 'react';
import './App.css';
import { Location, getCurrentLocation, setCurrentLocation, searchCities, BUILT_IN_CITIES } from './utils/locationService';
import { getWeather } from './services/weatherService';
import { applyTheme, loadInitialTheme, ThemeName } from './services/themeService';
import { startHealthMonitoring, stopHealthMonitoring, getHealthSettings, formatTime, HealthStats } from './services/healthService';
import { startEyeHealthMonitoring, stopEyeHealthMonitoring, getEyeHealthSettings, getRandomHalloweenCharacter, completeBreak, skipBreak, EyeHealthStats } from './services/eyeHealthService';
import { WelcomeTooltip } from './components/WelcomeTooltip';
import { ZombieWarning } from './components/ZombieWarning';
import { EyeBreakReminder } from './components/EyeBreakReminder';
import { Language, getCurrentLanguage, setCurrentLanguage, getTranslations } from './i18n/translations';
import { sendThemeChangeNotification } from './services/discordService';

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
  const [eyeHealthStats, setEyeHealthStats] = useState<EyeHealthStats | null>(null);
  const [showZombieWarning, setShowZombieWarning] = useState(false);
  const [showEyeBreak, setShowEyeBreak] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);
  const [halloweenCharacter, setHalloweenCharacter] = useState(getRandomHalloweenCharacter());
  const [currentLanguage, setLanguage] = useState<Language>(getCurrentLanguage());
  
  const t = getTranslations(currentLanguage);
  
  // UI state for advanced features
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showHealthSettings, setShowHealthSettings] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
  };
  
  // Get activity intensity color
  const getActivityColor = (intensity: number) => {
    if (intensity === 0) return '#4a5568';
    if (intensity < 0.3) return '#48bb78';
    if (intensity < 0.7) return '#ed8936';
    return '#f56565';
  };
  
  // Get eye strain level
  const getEyeStrainLevel = (strain: number) => {
    if (strain < 30) return { emoji: '😊', text: t.safe || 'Safe', color: '#48bb78', class: 'safe' };
    if (strain < 60) return { emoji: '👻', text: t.ghost || 'Ghost', color: '#ed8936', class: 'ghost' };
    if (strain < 80) return { emoji: '🧟', text: t.zombie || 'Zombie', color: '#f56565', class: 'zombie' };
    return { emoji: '💀', text: t.danger || 'Danger!', color: '#c53030', class: 'danger' };
  };

  // Initial load
  useEffect(() => {
    loadInitialTheme();
    
    // Check if first run
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeTooltip(true);
    }
    
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
        // Zombie warning
        if (settings.enableWarnings) {
          setShowZombieWarning(true);
        }
      }
    );
    
    return () => {
      if (intervalId) {
        stopHealthMonitoring(intervalId);
      }
    };
  }, []);

  // Start eye health monitoring
  useEffect(() => {
    const settings = getEyeHealthSettings();
    if (!settings.enableEyeHealth) return;

    const intervalId = startEyeHealthMonitoring(
      (stats) => setEyeHealthStats(stats),
      () => {
        setHalloweenCharacter(getRandomHalloweenCharacter());
        setShowEyeBreak(true);
      },
      () => healthStats?.idleTime || 0
    );

    return () => {
      if (intervalId) {
        stopEyeHealthMonitoring(intervalId);
      }
    };
  }, [healthStats?.idleTime]);

  const handleCloseWelcome = () => {
    setShowWelcomeTooltip(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleCompleteBreak = () => {
    completeBreak();
    setShowEyeBreak(false);
  };

  const handleSkipBreak = () => {
    skipBreak();
    setShowEyeBreak(false);
  };

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

      // Send Discord notification
      await sendThemeChangeNotification(
        weatherData.theme,
        loc.name,
        loc.country,
        weatherData.weatherDescription
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
    <>
      {showWelcomeTooltip && <WelcomeTooltip onClose={handleCloseWelcome} />}
      {showZombieWarning && healthStats && (
        <ZombieWarning 
          onClose={() => setShowZombieWarning(false)}
          idleMinutes={Math.floor(healthStats.idleTime / 60)}
        />
      )}
      {showEyeBreak && (
        <EyeBreakReminder 
          onComplete={handleCompleteBreak}
          onSkip={handleSkipBreak}
          breakDuration={getEyeHealthSettings().breakDuration}
          character={halloweenCharacter}
        />
      )}
      
      <div className="container">
      <div className="header">
        <h1 className="title">sit-or-live 🧟</h1>
        <p className="subtitle">Sit or Live!</p>
        
        {/* Settings button (top right) */}
        <div 
          className="settings-button"
          onMouseEnter={() => setShowAppSettings(true)}
          onMouseLeave={() => setShowAppSettings(false)}
          style={{ position: 'relative' }}
        >
          ⚙️ App
          {showAppSettings && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.25rem',
              background: '#16213e',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '0.5rem',
              minWidth: '150px',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Language:</label>
                <select
                  value={currentLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as Language)}
                  style={{ width: '100%' }}
                >
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
            </div>
          )}
        </div>
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
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {location.name}
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="button" onClick={handleSearch} style={{ padding: '0.375rem 0.5rem' }}>
            🔍
          </button>
        </div>
        
        {/* Built-in cities - compact */}
        {showBuiltIn && searchResults.length === 0 && (
          <div className="quick-select">
            {BUILT_IN_CITIES.slice(0, 6).map((city) => (
              <button
                key={`${city.name}-${city.country}`}
                className="button"
                onClick={() => handleSelectLocation(city)}
              >
                {city.name}
              </button>
            ))}
          </div>
        )}
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="search-result-item"
                onClick={() => handleSelectLocation(result)}
              >
                {result.name}, {result.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weather Display */}
      {weather && (
        <div className="section">
          <h2 className="section-title">☁️ Weather</h2>
          <div className="weather-display">
            <div className="temperature">{Math.round(weather.temperature)}°C</div>
            <div className="weather-description">{weather.weatherDescription}</div>
            <div className="weather-timestamp">
              {new Date(weather.timestamp).toLocaleTimeString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="theme-badge">🎨 {weather.theme}</div>
          </div>
        </div>
      )}

      {/* Health Monitoring */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>💪 {t.healthTitle}</h2>
          <div 
            className="settings-button"
            onMouseEnter={() => setShowHealthSettings(true)}
            onMouseLeave={() => setShowHealthSettings(false)}
            style={{ position: 'relative', fontSize: '0.625rem' }}
          >
            ⚙️
            {showHealthSettings && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.25rem',
                background: '#16213e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                padding: '0.5rem',
                minWidth: '120px',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                fontSize: '0.75rem'
              }}>
                <div>Health Settings</div>
                <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  Coming soon...
                </div>
              </div>
            )}
          </div>
        </div>
        
        {healthStats ? (
          <>
            {/* Activity Intensity with bar */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  Activity Intensity
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  {Math.round(healthStats.activityLevel * 100)}%
                </span>
              </div>
              <div className="activity-bar-container">
                <div 
                  className="activity-bar shimmer"
                  style={{
                    width: `${healthStats.activityLevel * 100}%`,
                    background: `linear-gradient(90deg, ${getActivityColor(healthStats.activityLevel)}, ${getActivityColor(healthStats.activityLevel)}dd, ${getActivityColor(healthStats.activityLevel)})`,
                  }}
                />
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Work Time</div>
                <div className="stat-value">{formatTime(healthStats.sessionDuration)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Idle Time</div>
                <div className="stat-value">{formatTime(healthStats.idleTime)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Zombie Count</div>
                <div className="stat-value">0</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Break Count</div>
                <div className="stat-value">0</div>
              </div>
            </div>
            
            {/* Eye Strain with color coding */}
            {eyeHealthStats && (() => {
              const level = getEyeStrainLevel(eyeHealthStats.eyeStrain);
              return (
                <div className={`eye-strain ${level.class}`} style={{ marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>
                    {level.emoji} Eye Strain: {level.text}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    {Math.round(eyeHealthStats.eyeStrain)}%
                  </span>
                </div>
              );
            })()}
          </>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            Health monitoring starting...
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        Kiroween Hackathon 2025 | Frankenstein Category
      </div>
    </div>
    </>
  );
}

export default App;

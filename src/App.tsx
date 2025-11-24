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

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLanguage(lang);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 className="title">{t.appTitle}</h1>
            <p className="subtitle">{t.appSlogan}</p>
          </div>
          <select
            value={currentLanguage}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
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
        <h2 className="section-title">{t.locationTitle}</h2>
        {location && (
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>{location.name}, {location.country}</strong>
          </p>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            className="input"
            placeholder={t.locationPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="button" onClick={handleSearch}>
            {t.searchButton}
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
        <h2 className="section-title">{t.healthTitle}</h2>
        {healthStats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">{t.idleTime}</div>
              <div className="stat-value">{formatTime(healthStats.idleTime)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t.activityLevel}</div>
              <div className="stat-value">{Math.round(healthStats.activityLevel * 100)}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">{t.sessionDuration}</div>
              <div className="stat-value">{formatTime(healthStats.sessionDuration)}</div>
            </div>
            {eyeHealthStats && (
              <div className="stat-card">
                <div className="stat-label">{t.eyeStrain}</div>
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
        <h2 className="section-title">{t.aboutTitle}</h2>
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
    </>
  );
}

export default App;

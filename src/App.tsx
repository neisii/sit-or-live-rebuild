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
import { SettingsPanel } from './components/SettingsPanel';
import { HelpPanel } from './components/HelpPanel';
import { HealthSettingsModal } from './components/HealthSettingsModal';
import { Language, getCurrentLanguage, setCurrentLanguage, getTranslations } from './i18n/translations';
import { sendThemeChangeNotification } from './services/discordService';
import { loadSettings, saveSettings } from './services/settingsService';

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
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'theme' | 'discord' | 'health' | 'logs'>('general');
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showHealthSettingsModal, setShowHealthSettingsModal] = useState(false);
  
  // Settings state
  const [selectedIDE, setSelectedIDE] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordEnabled, setDiscordEnabled] = useState(false);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  
  // Counters
  const [zombieCount, setZombieCount] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  const [completedBreaks, setCompletedBreaks] = useState(0);

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

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setSelectedIDE(settings.selectedIDE);
    setSelectedTerminal(settings.selectedTerminal);
    setDiscordWebhook(settings.discordWebhook);
    setDiscordEnabled(settings.enableDiscordNotifications);
    setAlwaysOnTop(settings.alwaysOnTop);
  }, []);

  // Save settings when they change
  useEffect(() => {
    const settings = loadSettings();
    settings.selectedIDE = selectedIDE;
    settings.selectedTerminal = selectedTerminal;
    settings.discordWebhook = discordWebhook;
    settings.enableDiscordNotifications = discordEnabled;
    settings.alwaysOnTop = alwaysOnTop;
    saveSettings(settings);
    
    // Also save to localStorage for theme service
    localStorage.setItem('selected_ide', selectedIDE);
    localStorage.setItem('selected_terminal', selectedTerminal);
  }, [selectedIDE, selectedTerminal, discordWebhook, discordEnabled, alwaysOnTop]);

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
          setZombieCount(prev => prev + 1);
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
        setBreakCount(prev => prev + 1);
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
    setCompletedBreaks(prev => prev + 1);
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

      // Send Discord notification if enabled
      if (discordEnabled && discordWebhook) {
        await sendThemeChangeNotification(
          weatherData.theme,
          loc.name,
          loc.country,
          weatherData.weatherDescription,
          discordWebhook
        );
      }
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
        <p className="subtitle">{currentLanguage === 'ko' ? '일하면서 건강 지키기!' : 'Stay healthy while working!'}</p>
        
        {/* Settings and Help buttons (top right) */}
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', display: 'flex', gap: '0.25rem' }}>
          <button 
            className="settings-button"
            onClick={() => {
              setSettingsInitialTab('general');
              setShowSettingsPanel(true);
            }}
            style={{ position: 'static' }}
          >
            ⚙️
          </button>
          <button 
            className="settings-button"
            onClick={() => setShowHelpPanel(true)}
            style={{ position: 'static' }}
          >
            ❓
          </button>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>📍 Location</h2>
          {location && (
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {location.name}
            </span>
          )}
        </div>
        
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
          <button 
            onClick={() => setShowHealthSettingsModal(true)}
            style={{ 
              position: 'static',
              background: 'var(--bg-card)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            title="Open Health Settings"
          >
            ⚙️
          </button>
        </div>
        
        {healthStats ? (
          <>
            {/* Activity Intensity with bar */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                  🔥 Activity Intensity
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
                <div className="stat-value">{zombieCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Breaks</div>
                <div className="stat-value">{completedBreaks}/{breakCount}</div>
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
    
    {/* Settings Panel */}
    {showSettingsPanel && (
      <SettingsPanel
        onClose={() => {
          setShowSettingsPanel(false);
          setSettingsInitialTab('general'); // Reset to general tab
        }}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        selectedIDE={selectedIDE}
        onIDEChange={setSelectedIDE}
        selectedTerminal={selectedTerminal}
        onTerminalChange={setSelectedTerminal}
        discordWebhook={discordWebhook}
        onDiscordWebhookChange={setDiscordWebhook}
        discordEnabled={discordEnabled}
        onDiscordEnabledChange={setDiscordEnabled}
        alwaysOnTop={alwaysOnTop}
        onAlwaysOnTopChange={setAlwaysOnTop}
        initialTab={settingsInitialTab}
      />
    )}
    
    {/* Help Panel */}
    {showHelpPanel && (
      <HelpPanel onClose={() => setShowHelpPanel(false)} />
    )}
    
    {/* Health Settings Modal */}
    {showHealthSettingsModal && (
      <HealthSettingsModal onClose={() => setShowHealthSettingsModal(false)} />
    )}
    </>
  );
}

export default App;

# 09_COMPONENT_SPECIFICATIONS

## Purpose

Complete specifications for every React component in the desktop app, including props, state, hooks, and full implementations. This document reflects the **ACTUAL CURRENT IMPLEMENTATION** with all advanced features.

## Prerequisites

- React 18.3.1 knowledge
- TypeScript understanding
- Component architecture patterns
- Tauri API knowledge

## Component Architecture

```
App.tsx (Root)
├── WelcomeTooltip.tsx (First-run guide with animations)
├── ZombieWarning.tsx (Idle warning modal with auto-close)
└── EyeBreakReminder.tsx (Eye health modal with countdown)
```

## Key Features

### Advanced UI Features
- **Hover Popups**: Settings and help accessible via hover (no clicks needed)
- **Activity Intensity Visualization**: Real-time bar chart with color coding
- **Eye Strain Levels**: Dynamic color-coded health indicators
- **Dual Timer System**: Separate health and eye health monitoring
- **Discord Integration**: Webhook configuration and testing
- **IDE/Terminal Selection**: Theme application to external tools
- **Log Management**: Export and view logs from UI
- **Always On Top**: Window pinning with platform detection
- **Multi-language**: English/Korean with live switching

## Core Components

### 1. App.tsx (Root Component)

**Location**: `src/App.tsx`

**Purpose**: Main application container, orchestrates all features

**State** (Complete):
```typescript
interface AppState {
  // Location
  location: Location | null;
  searchQuery: string;
  searchResults: Location[];
  
  // Weather
  weather: WeatherData | null;
  loading: boolean;
  error: string;
  
  // Health Monitoring
  healthStats: HealthStats | null;
  showZombieWarning: boolean;
  healthSettings: HealthSettings;
  monitoringIntervalId: number | null;
  
  // Eye Health (Advanced)
  eyeHealthStats: EyeHealthStats | null;
  showEyeBreak: boolean;
  eyeHealthSettings: EyeHealthSettings;
  eyeMonitoringIntervalId: number | null;
  halloweenCharacter: { emoji: string; title: string; message: string };
  
  // App Settings
  currentLanguage: Language;
  alwaysOnTop: boolean;
  isTogglingAlwaysOnTop: boolean;
  alwaysOnTopSupported: boolean;
  
  // UI State
  showWelcomeTooltip: boolean;
  tick: number; // For 1-second UI updates
  
  // Discord Integration
  discordWebhookUrl: string;
  discordEnabled: boolean;
  
  // IDE/Terminal Integration
  selectedIDE: string; // 'vscode' | 'kiro' | ''
  selectedTerminal: string; // 'iterm2' | 'warp' | 'kitty' | 'hyper' | 'terminal' | ''
}

// Refs (for avoiding closure issues)
interface AppRefs {
  healthStatsRef: React.MutableRefObject<HealthStats | null>;
  debounceTimerRef: React.MutableRefObject<number | null>;
  isInitialMount: React.MutableRefObject<boolean>;
}
```

**Key Functions**:
```typescript
// Weather
const loadWeather = async (loc: Location, forceRefresh = false) => {
  setLoading(true);
  setError('');
  
  try {
    const weatherData = await getWeather(loc, forceRefresh);
    setWeather(weatherData);
    
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
    setError('날씨 정보를 가져올 수 없습니다.');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// Search
const handleSearch = async () => {
  if (searchQuery.length < 2) return;
  
  try {
    const results = await searchCities(searchQuery);
    setSearchResults(results);
  } catch (err) {
    console.error('Search failed:', err);
  }
};

// Location Selection
const handleSelectLocation = (loc: Location) => {
  setLocation(loc);
  setCurrentLocation(loc);
  setSearchResults([]);
  setSearchQuery('');
  loadWeather(loc, true);
};

// Settings
const handleUpdateSettings = (newSettings: Partial<HealthSettings>) => {
  const updated = { ...healthSettings, ...newSettings };
  setHealthSettings(updated);
  saveHealthSettings(updated);
};

const handleUpdateEyeSettings = (newSettings: Partial<EyeHealthSettings>) => {
  const updated = { ...eyeHealthSettings, ...newSettings };
  setEyeHealthSettings(updated);
  saveEyeHealthSettings(updated);
};

// Always On Top (with debouncing)
const handleAlwaysOnTopToggle = useCallback((enabled: boolean) => {
  if (debounceTimerRef.current !== null) {
    clearTimeout(debounceTimerRef.current);
  }
  
  debounceTimerRef.current = window.setTimeout(() => {
    handleAlwaysOnTopToggleImmediate(enabled);
    debounceTimerRef.current = null;
  }, 300);
}, [handleAlwaysOnTopToggleImmediate]);
```

**Effects**:
```typescript
// Initial load
useEffect(() => {
  loadInitialTheme();
  const savedLocation = getCurrentLocation();
  if (savedLocation) {
    setLocation(savedLocation);
    loadWeather(savedLocation);
  }
}, []);

// Health monitoring
useEffect(() => {
  if (monitoringIntervalId !== null) {
    stopHealthMonitoring(monitoringIntervalId);
  }
  
  const intervalId = startHealthMonitoring(
    (stats) => {
      setHealthStats(stats);
      healthStatsRef.current = stats;
    },
    () => setShowZombieWarning(true)
  );
  
  setMonitoringIntervalId(intervalId);
  
  return () => {
    if (intervalId !== null) {
      stopHealthMonitoring(intervalId);
    }
  };
}, [healthSettings.zombieThreshold, healthSettings.enableWarnings]);

// Eye health monitoring
useEffect(() => {
  let mounted = true;
  
  const startMonitoring = async () => {
    if (!eyeHealthSettings.enableEyeHealth) {
      if (eyeMonitoringIntervalId !== null) {
        await stopEyeHealthMonitoring(eyeMonitoringIntervalId);
        setEyeMonitoringIntervalId(null);
      }
      return;
    }

    if (eyeMonitoringIntervalId !== null) {
      await stopEyeHealthMonitoring(eyeMonitoringIntervalId);
    }

    const intervalId = await startEyeHealthMonitoring(
      (stats) => {
        if (mounted) setEyeHealthStats(stats);
      },
      () => {
        if (mounted) {
          setHalloweenCharacter(getRandomHalloweenCharacter());
          setShowEyeBreak(true);
        }
      },
      () => {
        const currentHealthStats = healthStatsRef.current;
        if (!currentHealthStats) return 60;
        return currentHealthStats.idleTime;
      }
    );

    if (mounted) {
      setEyeMonitoringIntervalId(intervalId);
    }
  };

  startMonitoring();

  return () => {
    mounted = false;
    if (eyeMonitoringIntervalId !== null) {
      stopEyeHealthMonitoring(eyeMonitoringIntervalId);
    }
  };
}, [eyeHealthSettings.enableEyeHealth, eyeHealthSettings.workDuration]);

// Always on top sync
useEffect(() => {
  if (isTogglingAlwaysOnTop) return;
  
  let isMounted = true;
  
  const syncAlwaysOnTop = async () => {
    try {
      const appWindow = getCurrentWindow();
      await appWindow.setAlwaysOnTop(alwaysOnTop);
      
      if (isMounted && isInitialMount.current) {
        setAlwaysOnTopSupported(true);
        isInitialMount.current = false;
      }
    } catch (err) {
      console.error('Failed to sync always on top:', err);
      
      if (isMounted && isInitialMount.current) {
        setAlwaysOnTopSupported(false);
        isInitialMount.current = false;
        
        if (alwaysOnTop) {
          setAlwaysOnTop(false);
          localStorage.setItem('alwaysOnTop', 'false');
        }
      }
    }
  };
  
  syncAlwaysOnTop();
  
  return () => {
    isMounted = false;
  };
}, [alwaysOnTop, isTogglingAlwaysOnTop]);
```

**JSX Structure** (Complete):
```tsx
<>
  {/* First-run Welcome Tooltip */}
  {showWelcomeTooltip && (
    <WelcomeTooltip onClose={handleCloseWelcomeTooltip} />
  )}
  
  <div className="container">
    {/* Header: Title + App Settings (Hover Popup) */}
    <div className="header-section">
      <div className="header-content">
        <h1>{t.appTitle}</h1>
        <p>{t.appSlogan}</p>
      </div>
      
      {/* App Settings Button with Hover Popup */}
      <div className="app-settings-container">
        <button className="app-settings-button">⚙️ App</button>
        
        <div className="app-settings-popup">
          <h3>App Settings</h3>
          
          {/* Always On Top */}
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={alwaysOnTop}
                disabled={isTogglingAlwaysOnTop || !alwaysOnTopSupported}
                onChange={(e) => handleAlwaysOnTopToggle(e.target.checked)}
              />
              {t.alwaysOnTop}
              {!alwaysOnTopSupported && <span>(Not supported)</span>}
            </label>
          </div>
          
          {/* Language Selection */}
          <div className="setting-item">
            <label>{t.language}:</label>
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          
          {/* IDE Selection */}
          <div className="setting-item">
            <label>IDE:</label>
            <select
              value={selectedIDE}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedIDE(value);
                localStorage.setItem('selected_ide', value);
                logger.info('IDE selected', { ide: value });
              }}
            >
              <option value="">None</option>
              <option value="vscode">VS Code</option>
              <option value="kiro">Kiro IDE</option>
            </select>
          </div>
          
          {/* Terminal Selection */}
          <div className="setting-item">
            <label>Terminal:</label>
            <select
              value={selectedTerminal}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedTerminal(value);
                localStorage.setItem('selected_terminal', value);
                logger.info('Terminal selected', { terminal: value });
              }}
            >
              <option value="">None</option>
              <option value="iterm2">iTerm2</option>
              <option value="warp">Warp</option>
              <option value="kitty">Kitty</option>
              <option value="hyper">Hyper</option>
              <option value="terminal">macOS Terminal</option>
            </select>
          </div>
          
          {/* Discord Notifications */}
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={discordEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setDiscordEnabled(enabled);
                  setDiscordEnabledState(enabled);
                  logger.info(`Discord notifications ${enabled ? 'enabled' : 'disabled'}`);
                }}
              />
              Discord Notifications
            </label>
          </div>
          
          {/* Discord Webhook URL (conditional) */}
          {discordEnabled && (
            <div className="setting-item">
              <label>Webhook URL:</label>
              <input
                type="url"
                value={discordWebhookUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setDiscordWebhookUrlState(url);
                  setDiscordWebhookUrl(url);
                }}
                placeholder="https://discord.com/api/webhooks/..."
                style={{ width: '100%', marginTop: '0.5rem' }}
              />
              <button
                onClick={async () => {
                  const success = await testDiscordWebhook();
                  alert(success ? '✅ 테스트 성공!' : '❌ 테스트 실패');
                }}
                style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
              >
                Test Webhook
              </button>
            </div>
          )}
          
          {/* Log Management */}
          <div className="setting-item" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={async () => {
                const success = await exportLogs();
                if (success) {
                  alert('✅ Logs exported successfully!\n\n2 files downloaded:\n- sit-or-live-frontend.log\n- sit-or-live-backend.log');
                }
                logger.info('Export logs triggered from UI');
              }}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              📋 Export Logs
            </button>
            <button
              onClick={() => {
                openLogDirectory();
                logger.info('Open log directory triggered from UI');
              }}
              style={{ width: '100%' }}
            >
              📁 Open Log Directory
            </button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Main Layout: Vertical Stack (Compact) */}
    <div className="main-layout">
      {/* Left Column: Search + Weather */}
      <div className="left-column">
        {/* Search Area */}
        <div className="card search-area">
          <div className="location-header">
            <h2>{t.locationTitle}</h2>
            {location && (
              <p className="current-location-compact">
                📍 {location.name}
              </p>
            )}
          </div>
          
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t.locationPlaceholder}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              {t.searchButton}
            </button>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => handleSelectLocation(result)}
                >
                  <span className="result-emoji">{result.emoji}</span>
                  <div className="result-info">
                    <span className="result-name">{result.name}</span>
                    <span className="result-details">
                      {formatLocationDetails(result)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weather Card (Theme Integrated) */}
        <div className="card weather-card">
          <h2>🌦️ Weather</h2>
          {loading ? (
            <p>로딩 중...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : weather ? (
            <div className="weather-content">
              <div className="weather-main">
                <span className="weather-desc">{weather.weatherDescription}</span>
                <span className="temperature">{weather.temperature}°C</span>
              </div>
              <div className="weather-footer">
                <p className="timestamp-small">
                  {new Date(weather.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="theme-badge">
                  🎨 {weather.theme}
                </p>
              </div>
            </div>
          ) : (
            <p>위치를 설정해주세요</p>
          )}
        </div>
      </div>

      {/* Right Column: Health Monitor (Advanced) */}
      {healthStats && (
        <div className="right-column">
          <div className="card health-card">
            <div className="card-header">
              <h2>{t.healthTitle}</h2>
              
              {/* Health Settings Button with Hover Popup */}
              <div className="health-settings-container">
                <button className="settings-button">
                  {t.settingsButton}
                </button>
                
                <div className="health-settings-popup">
                  <h3>{t.zombieWarningTitle}</h3>
                  <div className="setting-item">
                    <label>{t.zombieWarningTime}:</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={Math.floor(healthSettings.zombieThreshold / 60)}
                      onChange={(e) => handleUpdateSettings({ 
                        zombieThreshold: parseInt(e.target.value) * 60 
                      })}
                    />
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={healthSettings.enableWarnings}
                        onChange={(e) => handleUpdateSettings({ 
                          enableWarnings: e.target.checked 
                        })}
                      />
                      {t.zombieWarningEnable}
                    </label>
                  </div>
                  
                  <h3 style={{ marginTop: '1rem' }}>{t.eyeHealthTitle}</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={eyeHealthSettings.enableEyeHealth}
                        onChange={(e) => handleUpdateEyeSettings({ 
                          enableEyeHealth: e.target.checked 
                        })}
                      />
                      {t.eyeHealthEnable}
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>{t.workDuration}:</label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={Math.floor(eyeHealthSettings.workDuration / 60)}
                      onChange={(e) => handleUpdateEyeSettings({ 
                        workDuration: parseInt(e.target.value) * 60 
                      })}
                    />
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={eyeHealthSettings.breakReminder}
                        onChange={(e) => handleUpdateEyeSettings({ 
                          breakReminder: e.target.checked 
                        })}
                      />
                      {t.breakReminder}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Intensity Visualization (Top) */}
            {eyeHealthStats && eyeHealthSettings.enableEyeHealth && (
              <div className="activity-intensity">
                <div className="activity-header">
                  <span className="activity-label">
                    {getActivityLevelText(eyeHealthStats.activityIntensity).emoji}{' '}
                    활동 강도: {getActivityLevelText(eyeHealthStats.activityIntensity).text}{' '}
                    ({Math.round(eyeHealthStats.activityIntensity * 100)}%)
                  </span>
                </div>
                <div className="activity-bar">
                  <div 
                    className="activity-fill"
                    style={{ 
                      width: `${eyeHealthStats.activityIntensity * 100}%`,
                      backgroundColor: eyeHealthStats.activityIntensity < 0.4 
                        ? '#4ade80' 
                        : eyeHealthStats.activityIntensity < 0.7 
                        ? '#fbbf24' 
                        : '#ff6b6b'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Health Statistics (Dual Mode) */}
            <div className="health-stats">
              {eyeHealthStats && eyeHealthSettings.enableEyeHealth ? (
                <>
                  <div className="stat-item">
                    <span className="stat-label">작업 시간:</span>
                    <span className="stat-value">{formatDuration(eyeHealthStats.currentWorkDuration)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">눈 피로도:</span>
                    <span 
                      className="stat-value"
                      style={{ color: getEyeStrainLevel(eyeHealthStats.eyeStrainLevel).color }}
                    >
                      {getEyeStrainLevel(eyeHealthStats.eyeStrainLevel).emoji}{' '}
                      {getEyeStrainLevel(eyeHealthStats.eyeStrainLevel).text} ({eyeHealthStats.eyeStrainLevel}%)
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">좀비 경고:</span>
                    <span className="stat-value">{healthStats.zombieWarnings}회</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">완료한 휴식:</span>
                    <span className="stat-value">{eyeHealthStats.totalBreaks}회</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">건너뛴 휴식:</span>
                    <span className="stat-value">{eyeHealthStats.missedBreaks}회</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="stat-item">
                    <span className="stat-label">현재 유휴 시간:</span>
                    <span className="stat-value">{formatTime(healthStats.idleTime)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">세션 시간:</span>
                    <span className="stat-value">{formatTime(getSessionDuration(healthStats))}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">좀비 경고:</span>
                    <span className="stat-value">{healthStats.zombieWarnings}회</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Help Button with Hover Popup */}
            <div className="help-container">
              <button className="help-toggle-button">
                {t.helpToggle}
              </button>
              
              <div className="help-popup">
                <h3>{t.helpTitle}</h3>
                <p className="help-text" dangerouslySetInnerHTML={{ __html: t.helpActivity }} />
                <p className="help-text" dangerouslySetInnerHTML={{ __html: t.helpWorkTime }} />
                <p className="help-text" dangerouslySetInnerHTML={{ __html: t.helpEyeStrain }} />
                <p className="help-text" dangerouslySetInnerHTML={{ __html: t.helpRule }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <p className="info">
      Kiroween Hackathon 2025 | Frankenstein Category
    </p>
  </div>

  {/* Modals */}
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
      breakDuration={eyeHealthSettings.breakDuration}
      character={halloweenCharacter}
    />
  )}
</>
```

### 2. WelcomeTooltip.tsx

**Location**: `src/components/WelcomeTooltip.tsx`

**Purpose**: First-run guide with smooth animations

**Props**:
```typescript
interface WelcomeTooltipProps {
  onClose: () => void;
}
```

**Features**:
- Fade-in animation on mount
- Fade-out animation on close
- Detailed feature explanations
- Bilingual support (English/Korean)

**Implementation**:
```tsx
import { useEffect, useState } from 'react';
import './WelcomeTooltip.css';

interface WelcomeTooltipProps {
  onClose: () => void;
}

export function WelcomeTooltip({ onClose }: WelcomeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay for smooth animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div className={`welcome-tooltip-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="welcome-tooltip">
        <button className="tooltip-close" onClick={handleClose}>
          ✕
        </button>
        
        <h2>Welcome to sit-or-live! 🧟</h2>
        <p className="tooltip-subtitle">앉거나 살거나!</p>
        
        <div className="tooltip-content">
          <div className="tooltip-section">
            <h3>⚙️ App Settings</h3>
            <p>Hover over the "⚙️ App" button (top-right) to:</p>
            <ul>
              <li><strong>Always on Top</strong>: Keep app above other windows</li>
              <li><strong>Language</strong>: Switch between English/한국어</li>
              <li><strong>IDE/Terminal</strong>: Select tools for theme sync</li>
              <li><strong>Discord</strong>: Configure webhook notifications</li>
            </ul>
          </div>
          
          <div className="tooltip-section">
            <h3>💪 Health Monitor</h3>
            <p>Track your health while coding:</p>
            <ul>
              <li><strong>Activity Level</strong>: Real-time keyboard/mouse tracking</li>
              <li><strong>Eye Health</strong>: 20-20-20 rule reminders</li>
              <li><strong>Work Time</strong>: Actual active time (pauses when idle)</li>
              <li><strong>Eye Strain</strong>: Color-coded health indicators</li>
            </ul>
          </div>
          
          <div className="tooltip-section">
            <h3>🌤️ Weather & Theme</h3>
            <p>Auto theme switching based on weather:</p>
            <ul>
              <li>Search for your city or use auto-detection</li>
              <li>Halloween themes: Rainy Cemetery, Daylight Survivor, etc.</li>
              <li>Syncs to IDE, Terminal, and macOS system</li>
            </ul>
          </div>
        </div>
        
        <button className="tooltip-button" onClick={handleClose}>
          Got it! Let's start 🚀
        </button>
      </div>
    </div>
  );
}
```

**CSS** (`WelcomeTooltip.css`):
```css
.welcome-tooltip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.welcome-tooltip {
  background: var(--bg-secondary);
  border: 2px solid var(--accent);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
  animation: slideUp 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
}

.welcome-content {
  margin: 1.5rem 0;
}

.welcome-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.welcome-section .emoji {
  font-size: 2rem;
}

.got-it-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### 3. ZombieWarning.tsx

**Location**: `src/components/ZombieWarning.tsx`

**Purpose**: Alert user when idle too long with randomized messages

**Props**:
```typescript
interface ZombieWarningProps {
  onClose: () => void;
  idleMinutes?: number; // Optional, defaults to 30
}
```

**Features**:
- Random zombie-themed messages
- Auto-close after 10 seconds
- Click anywhere to dismiss
- Animated shake effect

**Implementation**:
```tsx
import { useEffect, useState } from 'react';
import './ZombieWarning.css';
import { getTranslations } from '../i18n/translations';

interface ZombieWarningProps {
  onClose: () => void;
  idleMinutes?: number;
}

const getZombieMessages = (minutes: number, t: ReturnType<typeof getTranslations>) => [
  t.zombieMessage.replace('{minutes}', minutes.toString()),
  "🧟‍♂️ Move! Before you become a zombie!",
  "🧟‍♀️ Stand up and stretch!",
  "💀 Sitting kills!",
  "🦴 Your back is getting stiff...",
  `👻 ${minutes} minutes of no movement!`,
];

export const ZombieWarning = ({ onClose, idleMinutes = 30 }: ZombieWarningProps) => {
  const t = getTranslations();
  const [message] = useState(() => {
    const messages = getZombieMessages(idleMinutes, t);
    return messages[Math.floor(Math.random() * messages.length)];
  });
  
  useEffect(() => {
    // Auto-close after 10 seconds
    const timer = setTimeout(onClose, 10000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="zombie-warning-overlay" onClick={onClose}>
      <div className="zombie-warning" onClick={(e) => e.stopPropagation()}>
        <div className="zombie-emoji">🧟</div>
        <h2 className="zombie-message">{message}</h2>
        <p className="zombie-advice">
          {t.zombieAdvice}
        </p>
        <button className="zombie-button" onClick={onClose}>
          {t.zombieButton}
        </button>
      </div>
    </div>
  );
};
```

**CSS** (`ZombieWarning.css`):
```css
.zombie-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.zombie-warning {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid #ff6b6b;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
  animation: shake 0.5s ease-in-out;
}

.zombie-emoji {
  font-size: 4rem;
  animation: bounce 1s infinite;
}

.zombie-message {
  font-size: 1.1rem;
  margin: 1rem 0;
  color: #ff6b6b;
}

.zombie-button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.zombie-button:hover {
  transform: scale(1.05);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### 4. EyeBreakReminder.tsx

**Location**: `src/components/EyeBreakReminder.tsx`

**Purpose**: 20-20-20 rule reminder with countdown and Halloween characters

**Props**:
```typescript
interface EyeBreakReminderProps {
  onComplete: () => void;
  onSkip: () => void;
  breakDuration: number; // seconds (default: 20)
  character: {
    emoji: string;
    title: string;
    message: string;
  };
}
```

**Features**:
- Countdown timer with auto-complete
- Random Halloween character each time
- Click overlay to skip
- Detailed 20-20-20 rule explanation
- Health tips during break

**Implementation**:
```tsx
import { useState, useEffect } from 'react';
import './EyeBreakReminder.css';
import { getTranslations } from '../i18n/translations';

interface EyeBreakReminderProps {
  onComplete: () => void;
  onSkip: () => void;
  breakDuration: number; // seconds
  character: { emoji: string; title: string; message: string };
}

export function EyeBreakReminder({ 
  onComplete, 
  onSkip, 
  breakDuration, 
  character 
}: EyeBreakReminderProps) {
  const t = getTranslations();
  const [timeLeft, setTimeLeft] = useState(breakDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="eye-break-overlay" onClick={onSkip}>
      <div className="eye-break-modal" onClick={(e) => e.stopPropagation()}>
        <div className="eye-break-content">
          <div className="eye-break-icon">{character.emoji}</div>
          <h2>{character.title}</h2>
          <p className="eye-break-message">{character.message}</p>
          <p className="eye-break-rule">{t.breakRule}</p>
          <p className="eye-break-description">
            {t.breakDescription.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i === 0 && <br />}
              </span>
            ))}
          </p>
          <div className="eye-break-timer">
            <div className="timer-circle">
              <span className="timer-text">{timeLeft}{t.seconds}</span>
            </div>
          </div>
          <div className="eye-break-tips">
            <p>{t.breakTip1}</p>
            <p>{t.breakTip2}</p>
          </div>
          <div className="eye-break-buttons">
            <button className="eye-break-complete" onClick={onComplete}>
              {t.breakComplete}
            </button>
            <button className="eye-break-skip" onClick={onSkip}>
              {t.breakSkip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**CSS** (`EyeBreakReminder.css`):
```css
.eye-break-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.eye-break-modal {
  background: var(--bg-secondary);
  border: 2px solid #4ade80;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  text-align: center;
}

.character-emoji {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.countdown {
  position: relative;
  margin: 2rem auto;
  width: 120px;
  height: 120px;
}

.countdown-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: #4ade80;
}

.eye-break-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.complete-button {
  flex: 1;
  background: #4ade80;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.skip-button {
  flex: 1;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--text-secondary);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
}
```

## Advanced Features Implementation

### 1. Hover Popups (No Click Required)

**App Settings Popup**:
```css
.app-settings-popup {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
}

.app-settings-container:hover .app-settings-popup {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
```

**Health Settings Popup**: Same pattern, appears on hover
**Help Popup**: Appears from bottom on hover

### 2. Activity Intensity Bar

**Features**:
- Real-time width animation
- Color-coded: Green (low) → Yellow (medium) → Red (high)
- Shimmer effect for visual feedback

```css
.activity-bar {
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.activity-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 12px;
}

.activity-fill::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 3. Eye Strain Color Coding

**Logic**:
```typescript
const getEyeStrainLevel = (level: number) => {
  if (level < 30) return { emoji: '😊', text: 'Good', color: '#4ade80' };
  if (level < 60) return { emoji: '😐', text: 'Moderate', color: '#fbbf24' };
  if (level < 80) return { emoji: '😫', text: 'High', color: '#ff6b6b' };
  return { emoji: '🤯', text: 'Critical', color: '#dc2626' };
};
```

### 4. Dual Health Monitoring Mode

**Conditional Rendering**:
- When eye health enabled: Shows work time, eye strain, breaks
- When eye health disabled: Shows idle time, session time, warnings

**State Management**:
```typescript
// Ref to avoid closure issues
const healthStatsRef = useRef<HealthStats | null>(null);

// Eye health monitoring uses ref
const intervalId = await startEyeHealthMonitoring(
  (stats) => setEyeHealthStats(stats),
  () => setShowEyeBreak(true),
  () => healthStatsRef.current?.idleTime || 60 // Access latest value
);
```

### 5. Always On Top with Platform Detection

**Features**:
- Detects if platform supports always-on-top
- Disables checkbox if not supported
- Debounced to prevent rapid toggling
- Rollback on failure

```typescript
const handleAlwaysOnTopToggle = useCallback((enabled: boolean) => {
  if (debounceTimerRef.current !== null) {
    clearTimeout(debounceTimerRef.current);
  }
  
  debounceTimerRef.current = window.setTimeout(() => {
    handleAlwaysOnTopToggleImmediate(enabled);
    debounceTimerRef.current = null;
  }, 300);
}, [handleAlwaysOnTopToggleImmediate]);
```

### 6. Log Management

**Features**:
- Export logs to Downloads folder
- Open log directory in Finder/Explorer
- Separate frontend and backend logs

```typescript
const exportLogs = async () => {
  try {
    await invoke('export_logs');
    return true;
  } catch (err) {
    console.error('Failed to export logs:', err);
    return false;
  }
};
```

### 7. Compact UI Design

**Layout**:
- Max width: 320px (slim sidebar)
- Vertical stack layout
- Minimal padding (0.5rem)
- Compact font sizes (0.8rem - 0.9rem)
- Hover popups to save space

**Responsive**:
```css
.container {
  width: 100%;
  max-width: 320px;
  margin: 0;
  padding: 0.5rem;
  box-sizing: border-box;
  overflow-x: hidden;
}
```

## Verification

### Component Checklist

```bash
# Check all components exist
ls -la src/components/

# Expected files:
# - WelcomeTooltip.tsx
# - WelcomeTooltip.css
# - ZombieWarning.tsx
# - ZombieWarning.css
# - EyeBreakReminder.tsx
# - EyeBreakReminder.css

# Check App.tsx and App.css
ls -la src/App.tsx src/App.css

# Test compilation
npm run build

# Expected: No TypeScript errors
```

### Component Testing

```typescript
// Test WelcomeTooltip
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeTooltip } from './WelcomeTooltip';

test('closes on button click', () => {
  const onClose = jest.fn();
  render(<WelcomeTooltip onClose={onClose} />);
  
  fireEvent.click(screen.getByText('Got it!'));
  expect(onClose).toHaveBeenCalled();
});

// Test ZombieWarning
test('displays idle minutes', () => {
  render(<ZombieWarning onClose={() => {}} idleMinutes={30} />);
  expect(screen.getByText(/30/)).toBeInTheDocument();
});

// Test EyeBreakReminder
test('countdown works', async () => {
  jest.useFakeTimers();
  const onComplete = jest.fn();
  
  render(
    <EyeBreakReminder 
      onComplete={onComplete}
      onSkip={() => {}}
      breakDuration={20}
      character="👻"
    />
  );
  
  jest.advanceTimersByTime(20000);
  expect(onComplete).toHaveBeenCalled();
});
```

## Key Differences from Basic Implementation

This document describes the **ACTUAL PRODUCTION IMPLEMENTATION** which includes:

### Additional Features Not in Basic Spec:
1. **Activity Intensity Visualization** - Real-time bar chart with shimmer effect
2. **Eye Strain Color Coding** - Dynamic health indicators (Good/Moderate/High/Critical)
3. **Dual Health Monitoring** - Separate modes for basic and advanced tracking
4. **Hover Popups** - Settings accessible without clicks
5. **Discord Integration** - Webhook configuration and testing
6. **IDE/Terminal Selection** - Theme sync to external tools
7. **Log Management** - Export and view logs from UI
8. **Always On Top** - Platform detection and debouncing
9. **Compact Design** - 320px width optimized for sidebar
10. **Auto-close Modals** - Zombie warning auto-dismisses after 10s

### Why These Features Were Added:
- **User Experience**: Hover popups reduce clicks, compact design saves space
- **Health Tracking**: Activity intensity and eye strain provide better feedback
- **Developer Tools**: Log export and IDE integration for power users
- **Polish**: Animations, color coding, and auto-close improve feel

## Troubleshooting

### Issue: Components not rendering

**Solution**: Check imports and CSS files are included

### Issue: TypeScript errors

**Solution**: Verify all prop types match interfaces

### Issue: Animations not working

**Solution**: Check CSS animations are defined and browser supports them

### Issue: Hover popups not appearing

**Solution**: Verify CSS transitions and z-index are correct

### Issue: Activity bar not updating

**Solution**: Check healthStatsRef is being updated correctly

## Next Steps

Proceed to `10_SERVICE_LAYER.md` for business logic implementation.

---

**Document Version**: 2.0 (Updated to match actual implementation)  
**Last Updated**: 2025-11-24  
**Status**: Production-Ready

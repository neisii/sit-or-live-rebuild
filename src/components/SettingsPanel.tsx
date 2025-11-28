import { useState, useEffect } from 'react';
import './SettingsPanel.css';
import { Language } from '../i18n/translations';
import { setAlwaysOnTop } from '../services/settingsService';
import { openLogDirectory } from '../services/logService';
import { getHealthSettings, saveHealthSettings, HealthSettings } from '../services/healthService';
import { getEyeHealthSettings, saveEyeHealthSettings, EyeHealthSettings } from '../services/eyeHealthService';

interface SettingsPanelProps {
  onClose: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  selectedIDE: string;
  onIDEChange: (ide: string) => void;
  selectedTerminal: string;
  onTerminalChange: (terminal: string) => void;
  discordWebhook: string;
  onDiscordWebhookChange: (url: string) => void;
  discordEnabled: boolean;
  onDiscordEnabledChange: (enabled: boolean) => void;
  alwaysOnTop: boolean;
  onAlwaysOnTopChange: (enabled: boolean) => void;
  initialTab?: 'general' | 'theme' | 'discord' | 'health' | 'logs';
}

export function SettingsPanel({
  onClose,
  currentLanguage,
  onLanguageChange,
  selectedIDE,
  onIDEChange,
  selectedTerminal,
  onTerminalChange,
  discordWebhook,
  onDiscordWebhookChange,
  discordEnabled,
  onDiscordEnabledChange,
  alwaysOnTop,
  onAlwaysOnTopChange,
  initialTab = 'general',
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'discord' | 'health' | 'logs'>(initialTab);
  const [testingDiscord, setTestingDiscord] = useState(false);
  
  // Health settings state
  const [healthSettings, setHealthSettingsState] = useState<HealthSettings>(getHealthSettings());
  const [eyeHealthSettings, setEyeHealthSettingsState] = useState<EyeHealthSettings>(getEyeHealthSettings());

  // Load settings on mount
  useEffect(() => {
    setHealthSettingsState(getHealthSettings());
    setEyeHealthSettingsState(getEyeHealthSettings());
  }, []);

  const handleOpenLogs = async () => {
    try {
      await openLogDirectory();
    } catch (error) {
      alert('❌ Failed to open log directory');
    }
  };

  const handleHealthSettingChange = (key: keyof HealthSettings, value: any) => {
    const newSettings = { ...healthSettings, [key]: value };
    setHealthSettingsState(newSettings);
    saveHealthSettings(newSettings);
  };

  const handleEyeHealthSettingChange = (key: keyof EyeHealthSettings, value: any) => {
    const newSettings = { ...eyeHealthSettings, [key]: value };
    setEyeHealthSettingsState(newSettings);
    saveEyeHealthSettings(newSettings);
  };

  const handleAlwaysOnTopToggle = async () => {
    const newValue = !alwaysOnTop;
    console.log('Toggling always on top to:', newValue);
    
    try {
      await setAlwaysOnTop(newValue);
      onAlwaysOnTopChange(newValue);
      console.log('Always on top toggled successfully');
    } catch (error) {
      console.error('Failed to toggle always on top:', error);
      alert('Failed to toggle always on top: ' + error);
    }
  };

  const handleTestDiscord = async () => {
    if (!discordWebhook) return;
    
    setTestingDiscord(true);
    try {
      const response = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🧟 Test notification from Sit or Live!',
          embeds: [{
            title: 'Settings Test',
            description: 'Your Discord webhook is working correctly!',
            color: 0xff6b6b,
            timestamp: new Date().toISOString(),
          }],
        }),
      });

      if (response.ok) {
        alert('✅ Discord test successful!');
      } else {
        alert('❌ Discord test failed. Check your webhook URL.');
      }
    } catch (error) {
      alert('❌ Discord test failed. Check your webhook URL.');
    } finally {
      setTestingDiscord(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            Theme
          </button>
          <button
            className={`tab ${activeTab === 'discord' ? 'active' : ''}`}
            onClick={() => setActiveTab('discord')}
          >
            Discord
          </button>
          <button
            className={`tab ${activeTab === 'health' ? 'active' : ''}`}
            onClick={() => setActiveTab('health')}
          >
            Health
          </button>
          <button
            className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>Language</label>
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                >
                  <option value="en">English</option>
                  <option value="ko">한국어 (Korean)</option>
                </select>
              </div>

              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={alwaysOnTop}
                    onChange={handleAlwaysOnTopToggle}
                  />
                  Always on Top
                </label>
                <p className="setting-description">
                  Keep the app window above other windows
                </p>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>IDE</label>
                <select
                  value={selectedIDE}
                  onChange={(e) => onIDEChange(e.target.value)}
                >
                  <option value="">None</option>
                  <option value="vscode">VS Code</option>
                  <option value="kiro">Kiro IDE</option>
                </select>
                <p className="setting-description">
                  Select your IDE to apply themes automatically
                </p>
              </div>

              <div className="setting-item">
                <label>Terminal</label>
                <select
                  value={selectedTerminal}
                  onChange={(e) => onTerminalChange(e.target.value)}
                >
                  <option value="">None</option>
                  <option value="iterm2">iTerm2</option>
                  <option value="warp">Warp</option>
                  <option value="kitty">Kitty</option>
                  <option value="hyper">Hyper</option>
                  <option value="terminal">macOS Terminal</option>
                </select>
                <p className="setting-description">
                  Select your terminal to apply themes automatically
                </p>
              </div>
            </div>
          )}

          {activeTab === 'discord' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={discordEnabled}
                    onChange={(e) => onDiscordEnabledChange(e.target.checked)}
                  />
                  Enable Discord Notifications
                </label>
              </div>

              <div className="setting-item">
                <label>Webhook URL</label>
                <input
                  type="text"
                  value={discordWebhook}
                  onChange={(e) => onDiscordWebhookChange(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  disabled={!discordEnabled}
                />
                <p className="setting-description">
                  Get your webhook URL from Discord Server Settings → Integrations
                </p>
              </div>

              <button
                className="test-button"
                onClick={handleTestDiscord}
                disabled={!discordEnabled || !discordWebhook || testingDiscord}
              >
                {testingDiscord ? 'Testing...' : '🧪 Test Webhook'}
              </button>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="settings-section">
              <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                💪 Activity Monitoring
              </h3>
              
              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={healthSettings.enableWarnings}
                    onChange={(e) => handleHealthSettingChange('enableWarnings', e.target.checked)}
                  />
                  Enable Zombie Warnings
                </label>
                <p className="setting-description">
                  Alert when you've been idle for too long
                </p>
              </div>

              <div className="setting-item">
                <label>Zombie Warning Threshold</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="range"
                    min={300}
                    max={3600}
                    step={300}
                    value={healthSettings.zombieThreshold}
                    onChange={(e) => handleHealthSettingChange('zombieThreshold', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                    disabled={!healthSettings.enableWarnings}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '60px' }}>
                    {Math.floor(healthSettings.zombieThreshold / 60)} min
                  </span>
                </div>
                <p className="setting-description">
                  Alert after this many minutes of inactivity (5-60 min)
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />

              <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                👀 Eye Health (20-20-20 Rule)
              </h3>

              <div className="setting-item">
                <label>
                  <input 
                    type="checkbox" 
                    checked={eyeHealthSettings.enableEyeHealth}
                    onChange={(e) => handleEyeHealthSettingChange('enableEyeHealth', e.target.checked)}
                  />
                  Enable Eye Health Reminders
                </label>
                <p className="setting-description">
                  Every 20 minutes, look at something 20 feet away for 20 seconds
                </p>
              </div>

              <div className="setting-item">
                <label>Work Duration</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={eyeHealthSettings.workDuration}
                    onChange={(e) => handleEyeHealthSettingChange('workDuration', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                    disabled={!eyeHealthSettings.enableEyeHealth}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '60px' }}>
                    {eyeHealthSettings.workDuration} min
                  </span>
                </div>
                <p className="setting-description">
                  Time between eye break reminders (10-60 min)
                </p>
              </div>

              <div className="setting-item">
                <label>Break Duration</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={eyeHealthSettings.breakDuration}
                    onChange={(e) => handleEyeHealthSettingChange('breakDuration', parseInt(e.target.value))}
                    style={{ flex: 1 }}
                    disabled={!eyeHealthSettings.enableEyeHealth}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '60px' }}>
                    {eyeHealthSettings.breakDuration} sec
                  </span>
                </div>
                <p className="setting-description">
                  Duration of each eye break (10-60 sec)
                </p>
              </div>

              <div style={{ 
                marginTop: '1.5rem', 
                padding: '0.75rem', 
                background: 'rgba(72, 187, 120, 0.1)', 
                borderRadius: '4px',
                border: '1px solid rgba(72, 187, 120, 0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)' }}>
                  <strong>💡 Current Settings:</strong>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                  • Zombie warning: {healthSettings.enableWarnings ? `After ${Math.floor(healthSettings.zombieThreshold / 60)} min idle` : 'Disabled'}
                  <br />
                  • Eye breaks: {eyeHealthSettings.enableEyeHealth ? `Every ${eyeHealthSettings.workDuration} min for ${eyeHealthSettings.breakDuration} sec` : 'Disabled'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="settings-section">
              <div className="setting-item">
                <label>Application Logs</label>
                <p className="setting-description">
                  View and manage application logs for debugging
                </p>
              </div>

              <button
                className="test-button"
                onClick={handleOpenLogs}
                style={{ marginBottom: '1rem' }}
              >
                📂 Open Log Directory
              </button>

              <div className="setting-item">
                <label>Log Location</label>
                <p className="setting-description" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  ~/.sit-or-live/logs/
                </p>
              </div>

              <div className="setting-item">
                <label>Log Levels</label>
                <ul style={{ fontSize: '0.75rem', marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  <li><strong>INFO</strong>: General application events</li>
                  <li><strong>WARN</strong>: Warning messages</li>
                  <li><strong>ERROR</strong>: Error messages</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

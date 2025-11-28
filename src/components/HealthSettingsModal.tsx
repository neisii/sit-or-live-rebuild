import { useState, useEffect } from 'react';
import './HealthSettingsModal.css';
import { getHealthSettings, saveHealthSettings, HealthSettings } from '../services/healthService';
import { getEyeHealthSettings, saveEyeHealthSettings, EyeHealthSettings } from '../services/eyeHealthService';

interface HealthSettingsModalProps {
  onClose: () => void;
}

export function HealthSettingsModal({ onClose }: HealthSettingsModalProps) {
  const [healthSettings, setHealthSettingsState] = useState<HealthSettings>(getHealthSettings());
  const [eyeHealthSettings, setEyeHealthSettingsState] = useState<EyeHealthSettings>(getEyeHealthSettings());

  useEffect(() => {
    setHealthSettingsState(getHealthSettings());
    setEyeHealthSettingsState(getEyeHealthSettings());
  }, []);

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

  return (
    <div className="health-settings-overlay" onClick={onClose}>
      <div className="health-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="health-settings-header">
          <h2>💪 Health Monitor Settings</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="health-settings-content">
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

        <div className="health-settings-footer">
          <button className="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

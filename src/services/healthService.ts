import { invoke } from '@tauri-apps/api/core';

export interface HealthStats {
  idleTime: number; // seconds
  activityLevel: number; // 0-1 scale
  sessionDuration: number; // seconds
  lastActivityTime: number; // timestamp
}

export interface HealthSettings {
  zombieThreshold: number; // seconds (default: 1800 = 30 min)
  enableWarnings: boolean;
}

let sessionStartTime = Date.now();

export const getIdleTime = async (): Promise<number> => {
  try {
    const idleSeconds = await invoke<number>('get_idle_time');
    return idleSeconds;
  } catch (error) {
    console.error('Failed to get idle time:', error);
    return 0;
  }
};

export const calculateActivityLevel = (idleTime: number): number => {
  // Activity level based on idle time
  // 0-5s: Focused (1.0)
  // 5-30s: Working (0.7)
  // 30-60s: Relaxed (0.3)
  // 60s+: Resting (0.0)
  
  if (idleTime < 5) return 1.0;
  if (idleTime < 30) return 0.7;
  if (idleTime < 60) return 0.3;
  return 0.0;
};

export const startHealthMonitoring = (
  onUpdate: (stats: HealthStats) => void,
  onZombieWarning: () => void
): number => {
  let lastWarningTime = 0;
  
  const monitor = async () => {
    const idleTime = await getIdleTime();
    const activityLevel = calculateActivityLevel(idleTime);
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    const stats: HealthStats = {
      idleTime,
      activityLevel,
      sessionDuration,
      lastActivityTime: Date.now() - (idleTime * 1000),
    };
    
    onUpdate(stats);
    
    // Check for zombie warning (30 minutes idle)
    const settings = getHealthSettings();
    if (settings.enableWarnings && idleTime >= settings.zombieThreshold) {
      const now = Date.now();
      // Only show warning once every 5 minutes
      if (now - lastWarningTime > 5 * 60 * 1000) {
        onZombieWarning();
        lastWarningTime = now;
      }
    }
  };
  
  // Run immediately
  monitor();
  
  // Then every second
  const intervalId = window.setInterval(monitor, 1000);
  
  return intervalId;
};

export const stopHealthMonitoring = (intervalId: number): void => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export const getHealthSettings = (): HealthSettings => {
  try {
    const saved = localStorage.getItem('healthSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load health settings:', error);
  }
  
  // Default settings
  return {
    zombieThreshold: 1800, // 30 minutes
    enableWarnings: true,
  };
};

export const saveHealthSettings = (settings: HealthSettings): void => {
  try {
    localStorage.setItem('healthSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save health settings:', error);
  }
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

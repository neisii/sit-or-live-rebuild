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

// Activity history for smoothing (5-second moving average)
const ACTIVITY_HISTORY_SIZE = 5;
let activityHistory: number[] = [];

/**
 * Calculate activity intensity based on idle time with smooth transitions
 * 
 * Algorithm from ACTIVITY_INTENSITY_ALGORITHM.md:
 * - 0-3s idle: Focused (100% intensity)
 * - 3-10s idle: Working (70-100% intensity, linear decay)
 * - 10-30s idle: Relaxed (0-70% intensity, linear decay)
 * - 30s+ idle: Resting (0% intensity)
 * 
 * Uses 5-second moving average for smooth visual transitions
 */
export const calculateActivityLevel = (idleTime: number): number => {
  // 1. Calculate instantaneous intensity based on idle time
  let instantIntensity = 0;
  
  if (idleTime <= 3) {
    // Phase 1: Focused work (0-3 seconds idle)
    instantIntensity = 1.0;
  } else if (idleTime <= 10) {
    // Phase 2: Working (3-10 seconds idle)
    // Linear decay from 1.0 to 0.7
    // Formula: 1.0 - ((idleTime - 3) / 7) * 0.3
    instantIntensity = 1.0 - ((idleTime - 3) / 7) * 0.3;
  } else if (idleTime <= 30) {
    // Phase 3: Relaxed (10-30 seconds idle)
    // Linear decay from 0.7 to 0.0
    // Formula: 0.7 - ((idleTime - 10) / 20) * 0.7
    instantIntensity = 0.7 - ((idleTime - 10) / 20) * 0.7;
  }
  // Phase 4: Resting (30+ seconds idle) = 0.0
  
  // 2. Add to history for smoothing
  activityHistory.push(instantIntensity);
  if (activityHistory.length > ACTIVITY_HISTORY_SIZE) {
    activityHistory.shift(); // Remove oldest value
  }
  
  // 3. Calculate moving average (smooth transitions)
  const smoothedIntensity = activityHistory.reduce((sum, val) => sum + val, 0) 
                           / activityHistory.length;
  
  return smoothedIntensity;
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

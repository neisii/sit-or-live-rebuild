export interface EyeHealthStats {
  workTime: number; // seconds
  breakTime: number; // seconds
  eyeStrain: number; // 0-100 percentage
  totalBreaks: number;
  missedBreaks: number;
  isOnBreak: boolean;
}

export interface EyeHealthSettings {
  enableEyeHealth: boolean;
  workDuration: number; // minutes (default: 20)
  breakDuration: number; // seconds (default: 20)
}

let workStartTime = Date.now();
let currentWorkTime = 0;
let isOnBreak = false;
let totalBreaks = 0;
let missedBreaks = 0;

export const startEyeHealthMonitoring = (
  onUpdate: (stats: EyeHealthStats) => void,
  onBreakNeeded: () => void,
  getIdleTime: () => number
): number => {
  const settings = getEyeHealthSettings();
  const workDurationMs = settings.workDuration * 60 * 1000;
  
  const monitor = () => {
    if (isOnBreak) {
      // Don't update work time during break
      const stats = getEyeHealthStats();
      onUpdate(stats);
      return;
    }
    
    const idleTime = getIdleTime();
    
    // Pause work timer if idle for more than 5 seconds
    if (idleTime < 5) {
      const now = Date.now();
      const elapsed = now - workStartTime;
      currentWorkTime += elapsed;
      workStartTime = now;
      
      // Check if break is needed
      if (currentWorkTime >= workDurationMs) {
        onBreakNeeded();
        missedBreaks++;
      }
    } else {
      // Reset work start time when idle
      workStartTime = Date.now();
    }
    
    const stats = getEyeHealthStats();
    onUpdate(stats);
  };
  
  // Run immediately
  monitor();
  
  // Then every second
  const intervalId = window.setInterval(monitor, 1000);
  
  return intervalId;
};

export const stopEyeHealthMonitoring = (intervalId: number): void => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

export const completeBreak = (): void => {
  isOnBreak = false;
  currentWorkTime = 0;
  workStartTime = Date.now();
  totalBreaks++;
  if (missedBreaks > 0) {
    missedBreaks--;
  }
};

export const skipBreak = (): void => {
  isOnBreak = false;
  currentWorkTime = 0;
  workStartTime = Date.now();
};

export const startBreak = (): void => {
  isOnBreak = true;
};

export const calculateEyeStrain = (workTimeSeconds: number, activityLevel: number): number => {
  const settings = getEyeHealthSettings();
  const maxWorkTime = settings.workDuration * 60;
  
  // Base strain from work time (0-70%)
  const timeStrain = Math.min((workTimeSeconds / maxWorkTime) * 70, 70);
  
  // Additional strain from activity level (0-30%)
  const activityStrain = activityLevel * 30;
  
  return Math.min(timeStrain + activityStrain, 100);
};

export const getEyeHealthStats = (): EyeHealthStats => {
  const workTimeSeconds = Math.floor(currentWorkTime / 1000);
  const eyeStrain = calculateEyeStrain(workTimeSeconds, 0.5); // Simplified
  
  return {
    workTime: workTimeSeconds,
    breakTime: 0,
    eyeStrain,
    totalBreaks,
    missedBreaks,
    isOnBreak,
  };
};

export const getEyeHealthSettings = (): EyeHealthSettings => {
  try {
    const saved = localStorage.getItem('eyeHealthSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load eye health settings:', error);
  }
  
  // Default settings (20-20-20 rule)
  return {
    enableEyeHealth: false,
    workDuration: 20, // 20 minutes
    breakDuration: 20, // 20 seconds
  };
};

export const saveEyeHealthSettings = (settings: EyeHealthSettings): void => {
  try {
    localStorage.setItem('eyeHealthSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save eye health settings:', error);
  }
};

export const getRandomHalloweenCharacter = () => {
  const characters = [
    { emoji: '🧟', title: 'Zombie', message: 'Move before you become one!' },
    { emoji: '🧛', title: 'Vampire', message: 'Even vampires need breaks!' },
    { emoji: '👻', title: 'Ghost', message: "Don't haunt your desk forever!" },
    { emoji: '🎃', title: 'Pumpkin', message: 'Time to rest those eyes!' },
    { emoji: '💀', title: 'Skeleton', message: 'Your bones need movement!' },
    { emoji: '🕷️', title: 'Spider', message: 'Crawl away from the screen!' },
  ];
  
  return characters[Math.floor(Math.random() * characters.length)];
};

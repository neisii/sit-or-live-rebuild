export type Language = 'en' | 'ko';

export interface Translations {
  // App
  appTitle: string;
  appSlogan: string;
  
  // Location
  locationTitle: string;
  locationPlaceholder: string;
  searchButton: string;
  
  // Weather
  weatherTitle: string;
  
  // Health
  healthTitle: string;
  idleTime: string;
  activityLevel: string;
  sessionDuration: string;
  eyeStrain: string;
  
  // Eye Strain Levels
  safe: string;
  ghost: string;
  zombie: string;
  danger: string;
  
  // Settings
  settingsButton: string;
  alwaysOnTop: string;
  language: string;
  
  // Zombie Warning
  zombieMessage: string;
  zombieAdvice: string;
  zombieButton: string;
  
  // Eye Health
  eyeHealthTitle: string;
  eyeHealthEnable: string;
  workDuration: string;
  breakDuration: string;
  
  // About
  aboutTitle: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: '🧟 Sit or Live',
    appSlogan: 'Stay healthy while coding',
    
    locationTitle: '📍 Location',
    locationPlaceholder: 'Search city...',
    searchButton: 'Search',
    
    weatherTitle: '🌦️ Weather',
    
    healthTitle: '💪 Health Monitoring',
    idleTime: 'Idle Time',
    activityLevel: 'Activity',
    sessionDuration: 'Session',
    eyeStrain: 'Eye Strain',
    
    safe: 'Safe',
    ghost: 'Ghost',
    zombie: 'Zombie',
    danger: 'Danger!',
    
    settingsButton: '⚙️ Settings',
    alwaysOnTop: 'Always on Top',
    language: 'Language',
    
    zombieMessage: "🧟 You've been idle for {minutes} minutes!",
    zombieAdvice: 'Take a break! Walk around, stretch, or do some exercises. Your body will thank you! 💪',
    zombieButton: "I'm moving! 🏃",
    
    eyeHealthTitle: '👁️ Eye Health',
    eyeHealthEnable: 'Enable Eye Health',
    workDuration: 'Work Duration (min)',
    breakDuration: 'Break Duration (sec)',
    
    aboutTitle: 'ℹ️ About',
  },
  
  ko: {
    appTitle: '🧟 앉거나 살거나',
    appSlogan: '코딩하면서 건강 지키기',
    
    locationTitle: '📍 위치',
    locationPlaceholder: '도시 검색...',
    searchButton: '검색',
    
    weatherTitle: '🌦️ 날씨',
    
    healthTitle: '💪 건강 모니터링',
    idleTime: '유휴 시간',
    activityLevel: '활동량',
    sessionDuration: '세션',
    eyeStrain: '눈 피로도',
    
    safe: '안전',
    ghost: '유령',
    zombie: '좀비',
    danger: '위험!',
    
    settingsButton: '⚙️ 설정',
    alwaysOnTop: '항상 위에',
    language: '언어',
    
    zombieMessage: '🧟 {minutes}분 동안 움직이지 않았어요!',
    zombieAdvice: '휴식을 취하세요! 걷거나, 스트레칭하거나, 운동을 하세요. 몸이 고마워할 거예요! 💪',
    zombieButton: '움직일게요! 🏃',
    
    eyeHealthTitle: '👁️ 눈 건강',
    eyeHealthEnable: '눈 건강 활성화',
    workDuration: '작업 시간 (분)',
    breakDuration: '휴식 시간 (초)',
    
    aboutTitle: 'ℹ️ 정보',
  },
};

export function getTranslations(lang: Language = 'en'): Translations {
  return translations[lang];
}

export function getCurrentLanguage(): Language {
  try {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ko') {
      return saved;
    }
  } catch {
    // Ignore
  }
  return 'en';
}

export function setCurrentLanguage(lang: Language): void {
  try {
    localStorage.setItem('language', lang);
  } catch (error) {
    console.error('Failed to save language:', error);
  }
}

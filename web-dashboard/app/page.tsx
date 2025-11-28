'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ThemeSelector from './components/ThemeSelector';
import ThemePreview from './components/ThemePreview';

// Dynamically import map to avoid SSR issues
const ThemeMap = dynamic(() => import('./components/ThemeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  ),
});

export interface Theme {
  id: string;
  name: string;
  weather: string;
  weatherEmoji: string;
  description: string;
  colors: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

const themes: Theme[] = [
  {
    id: 'daylight-survivor',
    name: 'Daylight Survivor',
    weather: 'Clear',
    weatherEmoji: '☀️',
    description: 'Bright and warm colors for clear weather',
    colors: {
      background: '#fffcdc',
      primary: '#ff6347',
      secondary: '#ffa500',
      accent: '#ffd700',
    },
  },
  {
    id: 'vampire-night',
    name: 'Vampire Night',
    weather: 'Cloudy/Night',
    weatherEmoji: '🌙',
    description: 'Dark and mysterious for cloudy days',
    colors: {
      background: '#1a1a2e',
      primary: '#16213e',
      secondary: '#0f3460',
      accent: '#e94560',
    },
  },
  {
    id: 'silent-hill',
    name: 'Silent Hill',
    weather: 'Foggy',
    weatherEmoji: '🌫️',
    description: 'Foggy and atmospheric',
    colors: {
      background: '#2c3e50',
      primary: '#34495e',
      secondary: '#7f8c8d',
      accent: '#95a5a6',
    },
  },
  {
    id: 'rainy-cemetery',
    name: 'Rainy Cemetery',
    weather: 'Rainy',
    weatherEmoji: '🌧️',
    description: 'Cool and moody for rainy weather',
    colors: {
      background: '#1e3a5f',
      primary: '#2c5f8d',
      secondary: '#4682b4',
      accent: '#87ceeb',
    },
  },
  {
    id: 'frozen-dead',
    name: 'Frozen Dead',
    weather: 'Snowy',
    weatherEmoji: '❄️',
    description: 'Cold and icy for snowy conditions',
    colors: {
      background: '#0a1929',
      primary: '#1e3a5f',
      secondary: '#00bcd4',
      accent: '#b0e0e6',
    },
  },
  {
    id: 'frankenstein-lab',
    name: 'Frankenstein Lab',
    weather: 'Stormy',
    weatherEmoji: '⛈️',
    description: 'Electric and intense theme for storms',
    colors: {
      background: '#0b1b2a',
      primary: '#1b2b3b',
      secondary: '#415a77',
      accent: '#00ff00',
    },
  },
];

interface ThemeUsage {
  theme_name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  count: number;
}

export default function Home() {
  const [themeStats, setThemeStats] = useState<ThemeUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[5]); // Default to Frankenstein Lab

  useEffect(() => {
    // Mock data for now - in full version, this would fetch from Supabase
    const mockData: ThemeUsage[] = [
      { theme_name: 'Rainy Cemetery', city: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780, count: 1234 },
      { theme_name: 'Daylight Survivor', city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437, count: 5678 },
      { theme_name: 'Vampire Night', city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522, count: 1567 },
      { theme_name: 'Silent Hill', city: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, count: 890 },
      { theme_name: 'Frozen Dead', city: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173, count: 789 },
      { theme_name: 'Frankenstein Lab', city: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321, count: 234 },
      { theme_name: 'Rainy Cemetery', city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, count: 456 },
      { theme_name: 'Daylight Survivor', city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, count: 678 },
      { theme_name: 'Vampire Night', city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, count: 2345 },
      { theme_name: 'Silent Hill', city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194, count: 567 },
      { theme_name: 'Frozen Dead', city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832, count: 345 },
      { theme_name: 'Frankenstein Lab', city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050, count: 432 },
    ];

    setTimeout(() => {
      setThemeStats(mockData);
      setLoading(false);
    }, 500);
  }, []);



  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">🧟 Sit or Live</h1>
          <p className="text-xl text-gray-300">Weather-Based Theme Changer + Developer Health Manager</p>
        </header>

        {/* Side by Side Layout: Demo (Left) + Map (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
          {/* Interactive Theme Demo Section - LEFT */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-2">🎨 Interactive Theme Demo</h2>
              <p className="text-base text-gray-300">
                Preview themes based on weather conditions
              </p>
            </div>

            <ThemeSelector
              themes={themes}
              selectedTheme={selectedTheme}
              onSelectTheme={setSelectedTheme}
            />

            <ThemePreview theme={selectedTheme} />
          </section>

          {/* Global Statistics Section - RIGHT */}
          <section>
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-2">🌍 Global Theme Usage Map</h2>
              <p className="text-base text-gray-300">
                See how developers worldwide use Sit or Live themes
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                <p className="mt-4 text-gray-400">Loading statistics...</p>
              </div>
            ) : (
              <div>
                <ThemeMap data={themeStats} />
                <p className="text-center text-gray-400 mt-4 text-sm">
                  Circle size represents usage frequency. Click markers for details.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* CTA Section */}
        <div className="mb-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold mb-3">Want to use these themes?</h3>
          <p className="text-base mb-4">
            Download the desktop app to automatically change themes based on your local weather!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/yourusername/sit-or-live/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all inline-flex items-center justify-center gap-2"
            >
              💻 Download Desktop App
            </a>
            <a
              href="https://github.com/yourusername/sit-or-live"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all inline-flex items-center justify-center gap-2"
            >
              💻 View on GitHub
            </a>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-10">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-center">📊 About This Dashboard</h2>
            
            <div className="max-w-3xl mx-auto mb-6">
              <p className="text-gray-300 text-base mb-3 text-center">
                Visualize global theme usage statistics from <strong>Sit or Live</strong> users worldwide.
              </p>
              <p className="text-gray-400 text-sm text-center">
                This dashboard displays real-time analytics showing which Halloween-themed IDE/terminal 
                color schemes are most popular in different regions. All data is anonymous and aggregated 
                at the city level to protect user privacy.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🗺️</div>
                <div className="text-lg font-bold text-purple-400 mb-1">Interactive Map</div>
                <div className="text-xs text-gray-400">
                  Explore theme usage across 30+ cities worldwide with color-coded markers
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-lg font-bold text-purple-400 mb-1">6 Themes</div>
                <div className="text-xs text-gray-400">
                  Weather-based themes: Daylight Survivor, Vampire Night, Silent Hill, Rainy Cemetery, Frozen Dead, Frankenstein Lab
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💻</div>
                <div className="text-lg font-bold text-purple-400 mb-1">7 Platforms</div>
                <div className="text-xs text-gray-400">
                  VS Code, Kiro IDE, iTerm2, Warp, Kitty, Hyper, macOS Terminal
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold mb-3 text-center">🔄 How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">☁️</div>
                  <div className="font-semibold text-purple-400 mb-1">1. Weather Detection</div>
                  <div className="text-gray-400">App detects local weather conditions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">🎨</div>
                  <div className="font-semibold text-purple-400 mb-1">2. Theme Applied</div>
                  <div className="text-gray-400">Matching theme automatically applied to IDE/terminal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="font-semibold text-purple-400 mb-1">3. Stats Collected</div>
                  <div className="text-gray-400">Anonymous usage data aggregated here</div>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💪</span>
                  <span className="font-semibold text-sm">Health Monitoring</span>
                </div>
                <p className="text-xs text-gray-400">
                  Track activity levels, idle time, and get reminders to prevent sedentary lifestyle
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">👁️</span>
                  <span className="font-semibold text-sm">Eye Health (20-20-20 Rule)</span>
                </div>
                <p className="text-xs text-gray-400">
                  Get reminders every 20 minutes to look 20 feet away for 20 seconds
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Kiroween Hackathon 2025 | Frankenstein Category</p>
          <p className="mt-1">Built with Next.js, Supabase, and ❤️</p>
        </footer>
      </div>
    </main>
  );
}

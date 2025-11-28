'use client';

import { useState } from 'react';
import ThemeSelector from '../components/ThemeSelector';
import ThemePreview from '../components/ThemePreview';
import FeatureCards from '../components/FeatureCards';

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

export default function DemoPage() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[5]); // Default to Frankenstein Lab

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🎨 Interactive Theme Demo</h1>
          <p className="text-xl text-gray-300">
            Preview how themes change based on weather. Download the desktop app to use these themes automatically!
          </p>
        </header>

        {/* Theme Selector Grid */}
        <ThemeSelector
          themes={themes}
          selectedTheme={selectedTheme}
          onSelectTheme={setSelectedTheme}
        />

        {/* Theme Preview */}
        <ThemePreview theme={selectedTheme} />

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to use these themes?</h2>
          <p className="text-lg mb-6">
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

        {/* Feature Cards */}
        <FeatureCards />

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Kiroween Hackathon 2025 | Frankenstein Category</p>
        </footer>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface ThemeUsage {
  theme_name: string;
  city: string;
  country: string;
  count: number;
}

export default function Home() {
  const [themeStats, setThemeStats] = useState<ThemeUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in full version, this would fetch from Supabase
    const mockData: ThemeUsage[] = [
      { theme_name: 'Rainy Cemetery', city: 'Seoul', country: 'South Korea', count: 1234 },
      { theme_name: 'Daylight Survivor', city: 'Los Angeles', country: 'United States', count: 5678 },
      { theme_name: 'Vampire Night', city: 'Paris', country: 'France', count: 1567 },
      { theme_name: 'Silent Hill', city: 'Beijing', country: 'China', count: 890 },
      { theme_name: 'Frozen Dead', city: 'Moscow', country: 'Russia', count: 789 },
      { theme_name: 'Frankenstein Lab', city: 'Seattle', country: 'United States', count: 234 },
    ];

    setTimeout(() => {
      setThemeStats(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const themeEmojis: Record<string, string> = {
    'Daylight Survivor': '☀️',
    'Vampire Night': '🌙',
    'Silent Hill': '🌫️',
    'Rainy Cemetery': '🌧️',
    'Frozen Dead': '❄️',
    'Frankenstein Lab': '⛈️',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">🧟 Sit or Live</h1>
          <p className="text-xl text-gray-300">Global Theme Statistics</p>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeStats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">{themeEmojis[stat.theme_name]}</span>
                  <span className="text-3xl font-bold text-purple-400">{stat.count}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{stat.theme_name}</h3>
                <p className="text-sm text-gray-400">
                  📍 {stat.city}, {stat.country}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">About This Dashboard</h2>
            <p className="text-gray-300 mb-4">
              This dashboard shows real-time global statistics from sit-or-live users.
              All data is anonymous and aggregated at the city level.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-2xl font-bold text-purple-400">30+</div>
                <div className="text-sm text-gray-400">Cities</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-2xl font-bold text-purple-400">6</div>
                <div className="text-sm text-gray-400">Themes</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="text-3xl mb-2">💻</div>
                <div className="text-2xl font-bold text-purple-400">7</div>
                <div className="text-sm text-gray-400">Platforms</div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Kiroween Hackathon 2025 | Frankenstein Category</p>
          <p className="mt-2">Built with Next.js, Supabase, and ❤️</p>
        </footer>
      </div>
    </main>
  );
}

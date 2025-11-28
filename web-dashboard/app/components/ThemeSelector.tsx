'use client';

import { Theme } from '../demo/page';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme;
  onSelectTheme: (theme: Theme) => void;
}

export default function ThemeSelector({ themes, selectedTheme, onSelectTheme }: ThemeSelectorProps) {
  return (
    <div className="mb-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className={`bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-2 border-2 transition-all hover:scale-105 ${
              selectedTheme.id === theme.id
                ? 'border-orange-500 shadow-lg shadow-orange-500/50'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            aria-label={`Select ${theme.name} theme for ${theme.weather} weather`}
          >
            {/* Color Swatches */}
            <div className="flex gap-1 mb-1.5">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: theme.colors.background }}
                title={`Background: ${theme.colors.background}`}
              />
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: theme.colors.primary }}
                title={`Primary: ${theme.colors.primary}`}
              />
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: theme.colors.secondary }}
                title={`Secondary: ${theme.colors.secondary}`}
              />
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: theme.colors.accent }}
                title={`Accent: ${theme.colors.accent}`}
              />
            </div>

            {/* Theme Name */}
            <h3 className="text-xs font-bold mb-0.5">{theme.name}</h3>

            {/* Weather Condition */}
            <p className="text-[10px] text-gray-400">
              {theme.weather} {theme.weatherEmoji}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

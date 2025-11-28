'use client';

import { Theme } from '../demo/page';

interface ThemePreviewProps {
  theme: Theme;
}

export default function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div className="mb-3 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
      <div className="flex flex-col gap-3">
        {/* Theme Info & Color Palette */}
        <div className="flex flex-col lg:flex-row gap-3 items-start">
          {/* Theme Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-0.5">{theme.name}</h2>
            <p className="text-xs text-gray-400 mb-1">
              Weather: {theme.weather} {theme.weatherEmoji}
            </p>
            <p className="text-xs text-gray-300">{theme.description}</p>
          </div>

          {/* Color Palette */}
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Background */}
              <div className="text-center">
                <div
                  className="w-full h-10 rounded mb-0.5 border border-gray-600"
                  style={{ backgroundColor: theme.colors.background }}
                />
                <div className="text-[10px] text-gray-400">Bg</div>
                <div className="text-[9px] font-mono text-gray-500">{theme.colors.background}</div>
              </div>

              {/* Primary */}
              <div className="text-center">
                <div
                  className="w-full h-10 rounded mb-0.5 border border-gray-600"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <div className="text-[10px] text-gray-400">Primary</div>
                <div className="text-[9px] font-mono text-gray-500">{theme.colors.primary}</div>
              </div>

              {/* Secondary */}
              <div className="text-center">
                <div
                  className="w-full h-10 rounded mb-0.5 border border-gray-600"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <div className="text-[10px] text-gray-400">Secondary</div>
                <div className="text-[9px] font-mono text-gray-500">{theme.colors.secondary}</div>
              </div>

              {/* Accent */}
              <div className="text-center">
                <div
                  className="w-full h-10 rounded mb-0.5 border border-gray-600"
                  style={{ backgroundColor: theme.colors.accent }}
                />
                <div className="text-[10px] text-gray-400">Accent</div>
                <div className="text-[9px] font-mono text-gray-500">{theme.colors.accent}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Editor Preview - Always Visible */}
        <div>
          <h3 className="text-base font-bold mb-1.5 text-center">👁️ Live Code Preview</h3>
          <div
            className="rounded-lg p-3 font-mono text-[11px] shadow-2xl border border-gray-600"
            style={{ backgroundColor: theme.colors.background }}
          >
            <div className="mb-2" style={{ color: theme.colors.secondary }}>
              // {theme.name} Theme Preview
            </div>
            <div className="mb-1">
              <span style={{ color: theme.colors.accent }}>function</span>{' '}
              <span style={{ color: theme.colors.primary }}>greet</span>
              <span style={{ color: theme.colors.secondary }}>(</span>
              <span style={{ color: theme.colors.accent }}>name</span>
              <span style={{ color: theme.colors.secondary }}>)</span>{' '}
              <span style={{ color: theme.colors.secondary }}>{'{'}</span>
            </div>
            <div className="ml-3 mb-1">
              <span style={{ color: theme.colors.accent }}>return</span>{' '}
              <span style={{ color: theme.colors.primary }}>{`\`Hello, \${name}\``}</span>
              <span style={{ color: theme.colors.secondary }}>;</span>
            </div>
            <div className="mb-2" style={{ color: theme.colors.secondary }}>
              {'}'}
            </div>
            <div className="mb-1">
              <span style={{ color: theme.colors.secondary }}>console.</span>
              <span style={{ color: theme.colors.accent }}>log</span>
              <span style={{ color: theme.colors.secondary }}>(</span>
              <span style={{ color: theme.colors.primary }}>greet</span>
              <span style={{ color: theme.colors.secondary }}>(</span>
              <span style={{ color: theme.colors.primary }}>'World'</span>
              <span style={{ color: theme.colors.secondary }}>));</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

# 14_WEB_DASHBOARD

## Purpose

Complete Next.js web dashboard implementation with real-time statistics, interactive demo, and Supabase integration.

## Prerequisites

- Next.js 14.2.15 knowledge
- React 18.3.1
- Supabase client library
- Understanding of WebSocket/Realtime

## Dashboard Architecture

```
web-dashboard/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles
├── components/
│   ├── ThemeStats.tsx      # Global theme statistics
│   ├── ActivityMap.tsx     # Activity heatmap
│   └── InteractiveDemo.tsx # Theme demo
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   ├── cache.ts            # SWR cache
│   ├── useSWR.ts           # SWR hook
│   └── debounce.ts         # Debounce utility
└── public/                 # Static assets
```

## Complete Implementations

### 1. Layout (app/layout.tsx)

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sit or Live - Global Dashboard",
  description: "Real-time theme statistics and developer activity worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Homepage (app/page.tsx)

```typescript
import Link from 'next/link';
import ThemeStats from '@/components/ThemeStats';
import ActivityMap from '@/components/ActivityMap';
import InteractiveDemo from '@/components/InteractiveDemo';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-12">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold">
              🧟 Sit or Live
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-400">
            Global Dashboard - Real-time Theme Statistics & Activity
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          <section className="bg-[var(--bg-secondary)] rounded-lg p-4 md:p-6">
            <ThemeStats />
          </section>

          <section className="bg-[var(--bg-secondary)] rounded-lg p-4 md:p-6">
            <ActivityMap />
          </section>
        </div>

        <InteractiveDemo />

        <footer className="mt-8 md:mt-12 text-center text-gray-500">
          <p className="text-sm md:text-base">Built for Kiroween Hackathon 2025</p>
          <p className="text-xs md:text-sm mt-2">
            <Link href="https://github.com/neisii/sit-or-live" className="hover:text-gray-300 transition-colors">
              GitHub
            </Link>
            {' • '}
            <Link href="https://github.com/neisii/sit-or-live/releases" className="hover:text-gray-300 transition-colors">
              Download App
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
```

### 3. Supabase Client (lib/supabase.ts)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { ThemeUsage, ActivityHeatmap } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getGlobalThemeStats() {
  const { data, error } = await supabase
    .from('theme_usage')
    .select('*')
    .order('count', { ascending: false });
  
  if (error) {
    console.error('Failed to fetch theme stats:', error);
    return [];
  }
  
  return data as ThemeUsage[];
}

export async function getGlobalActivityHeatmap() {
  const { data, error } = await supabase
    .from('activity_heatmap')
    .select('*')
    .order('active_users', { ascending: false });
  
  if (error) {
    console.error('Failed to fetch activity heatmap:', error);
    return [];
  }
  
  return data as ActivityHeatmap[];
}

export function subscribeToThemeUpdates(callback: (payload: any) => void) {
  return supabase
    .channel('theme_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'theme_usage' },
      callback
    )
    .subscribe();
}

export function subscribeToActivityUpdates(callback: (payload: any) => void) {
  return supabase
    .channel('activity_updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'activity_heatmap' },
      callback
    )
    .subscribe();
}
```

### 4. Types (lib/types.ts)

```typescript
export type ThemeName = 
  | 'Daylight Survivor'
  | 'Vampire Night'
  | 'Silent Hill'
  | 'Rainy Cemetery'
  | 'Frozen Dead'
  | 'Frankenstein Lab';

export interface ThemeUsage {
  id: number;
  theme_name: ThemeName;
  city: string;
  country: string;
  weather_code: number;
  count: number;
  last_updated: string;
}

export interface ActivityHeatmap {
  id: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  hour: number;
  active_users: number;
  last_updated: string;
}
```

### 5. SWR Cache (lib/cache.ts)

```typescript
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class Cache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cache = new Cache();
```

### 6. SWR Hook (lib/useSWR.ts)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { cache } from './cache';

interface UseSWROptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  revalidateOnFocus?: boolean;
  revalidateInterval?: number;
}

export function useSWR<T>({
  key,
  fetcher,
  revalidateOnFocus = true,
  revalidateInterval
}: UseSWROptions<T>) {
  const [data, setData] = useState<T | null>(cache.get(key));
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const revalidate = useCallback(async () => {
    try {
      const newData = await fetcher();
      cache.set(key, newData);
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    if (!data) {
      revalidate();
    }
  }, [data, revalidate]);

  useEffect(() => {
    if (revalidateOnFocus) {
      const handleFocus = () => revalidate();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [revalidateOnFocus, revalidate]);

  useEffect(() => {
    if (revalidateInterval) {
      const interval = setInterval(revalidate, revalidateInterval);
      return () => clearInterval(interval);
    }
  }, [revalidateInterval, revalidate]);

  return { data, isLoading, error, revalidate };
}
```

### 7. Debounce Utility (lib/debounce.ts)

```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
```

### 8. ThemeStats Component (components/ThemeStats.tsx)

```typescript
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getGlobalThemeStats, supabase } from '@/lib/supabase';
import { useSWR } from '@/lib/useSWR';
import { debounce } from '@/lib/debounce';
import type { ThemeUsage } from '@/lib/types';

export default function ThemeStats({ className = '' }: { className?: string }) {
  const { data: cachedStats, isLoading, error: swrError, revalidate } = useSWR({
    key: 'theme_stats',
    fetcher: getGlobalThemeStats,
    revalidateOnFocus: true,
    revalidateInterval: 5 * 60 * 1000
  });

  const [stats, setStats] = useState<ThemeUsage[]>(cachedStats || []);
  const [error, setError] = useState<string | null>(null);

  const debouncedRevalidate = useMemo(
    () => debounce(revalidate, 1000),
    [revalidate]
  );

  useEffect(() => {
    if (cachedStats) {
      setStats(cachedStats);
    }
  }, [cachedStats]);

  useEffect(() => {
    if (swrError) {
      setError(String(swrError));
    }
  }, [swrError]);

  useEffect(() => {
    const channel = supabase
      .channel('theme_usage_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'theme_usage'
      }, (payload) => {
        console.log('[Realtime] Theme usage update:', payload);
        
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setStats((prev) => {
            const newData = payload.new as ThemeUsage;
            const index = prev.findIndex((t) => t.id === newData.id);
            
            if (index >= 0) {
              const currentTime = new Date(prev[index].last_updated).getTime();
              const updateTime = new Date(newData.last_updated).getTime();
              
              if (updateTime > currentTime) {
                const updated = [...prev];
                updated[index] = newData;
                return updated.sort((a, b) => b.count - a.count);
              }
              return prev;
            } else {
              return [...prev, newData].sort((a, b) => b.count - a.count);
            }
          });
          
          debouncedRevalidate();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [debouncedRevalidate]);

  const groupedStats = stats.reduce((acc, stat) => {
    if (!acc[stat.theme_name]) {
      acc[stat.theme_name] = {
        total: 0,
        cities: []
      };
    }
    acc[stat.theme_name].total += stat.count;
    acc[stat.theme_name].cities.push({
      city: stat.city,
      country: stat.country,
      count: stat.count
    });
    return acc;
  }, {} as Record<string, { total: number; cities: Array<{ city: string; country: string; count: number }> }>);

  const themeEmojis: Record<string, string> = {
    'Daylight Survivor': '☀️',
    'Vampire Night': '🌙',
    'Silent Hill': '🌫️',
    'Rainy Cemetery': '🌧️',
    'Frozen Dead': '❄️',
    'Frankenstein Lab': '⛈️'
  };

  const themeColors: Record<string, string> = {
    'Daylight Survivor': 'var(--accent-daylight)',
    'Vampire Night': 'var(--accent-vampire)',
    'Silent Hill': 'var(--accent-silent)',
    'Rainy Cemetery': 'var(--accent-rainy)',
    'Frozen Dead': 'var(--accent-frozen)',
    'Frankenstein Lab': 'var(--accent-frankenstein)'
  };

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} text-red-400`}>
        <p>Failed to load theme statistics</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  const totalUsers = Object.values(groupedStats).reduce((sum, theme) => sum + theme.total, 0);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🌍 Global Theme Usage</h2>
        <div className="text-sm text-gray-400">
          {totalUsers.toLocaleString()} users active
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedStats)
          .sort(([, a], [, b]) => b.total - a.total)
          .map(([themeName, data]) => {
            const emoji = themeEmojis[themeName] || '🎨';
            const color = themeColors[themeName] || '#888';
            const percentage = totalUsers > 0 ? (data.total / totalUsers * 100).toFixed(1) : 0;

            const topCities = data.cities
              .sort((a, b) => b.count - a.count)
              .slice(0, 3);

            return (
              <div
                key={themeName}
                className="bg-[var(--bg-secondary)] rounded-lg p-4 hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3 className="font-semibold" style={{ color }}>
                        {themeName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {data.total.toLocaleString()} users ({percentage}%)
                      </p>
                    </div>
                  </div>
                </div>

                {topCities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-2">Top cities:</p>
                    <div className="flex flex-wrap gap-2">
                      {topCities.map((city, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-700 px-2 py-1 rounded"
                        >
                          {city.city} ({city.count.toLocaleString()})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {stats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No theme data available yet</p>
          <p className="text-sm mt-2">Start using the app to see statistics!</p>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        Real-time updates via WebSocket
      </div>
    </div>
  );
}
```

## Verification

```bash
# Install dependencies
cd web-dashboard
npm install

# Run development server
npm run dev

# Expected: Server running on http://localhost:3000

# Build for production
npm run build

# Expected: .next/ folder created

# Test Playwright
npm test

# Expected: All tests pass
```

## Next Steps

Proceed to `15_REALTIME_SYSTEM.md` for WebSocket implementation details.

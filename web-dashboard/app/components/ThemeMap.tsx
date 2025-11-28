'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface ThemeUsage {
  theme_name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  count: number;
}

// Theme colors matching the app
const themeColors: Record<string, string> = {
  'Daylight Survivor': '#FFD700',
  'Vampire Night': '#8B00FF',
  'Silent Hill': '#708090',
  'Rainy Cemetery': '#4682B4',
  'Frozen Dead': '#B0E0E6',
  'Frankenstein Lab': '#9370DB',
};

const themeEmojis: Record<string, string> = {
  'Daylight Survivor': '☀️',
  'Vampire Night': '🌙',
  'Silent Hill': '🌫️',
  'Rainy Cemetery': '🌧️',
  'Frozen Dead': '❄️',
  'Frankenstein Lab': '⛈️',
};

// Component to fit map bounds
function MapBounds({ locations }: { locations: ThemeUsage[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  
  return null;
}

export default function ThemeMap({ data }: { data: ThemeUsage[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  // Calculate marker size based on usage count
  const getMarkerSize = (count: number) => {
    const maxCount = Math.max(...data.map(d => d.count));
    const minSize = 10;
    const maxSize = 40;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-700">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapBounds locations={data} />
        
        {data.map((location, index) => (
          <CircleMarker
            key={index}
            center={[location.latitude, location.longitude]}
            radius={getMarkerSize(location.count)}
            pathOptions={{
              fillColor: themeColors[location.theme_name] || '#888',
              fillOpacity: 0.7,
              color: themeColors[location.theme_name] || '#888',
              weight: 2,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-gray-900 p-2">
                <div className="text-2xl mb-2">{themeEmojis[location.theme_name]}</div>
                <div className="font-bold text-lg mb-1">{location.theme_name}</div>
                <div className="text-sm mb-2">
                  📍 {location.city}, {location.country}
                </div>
                <div className="text-xl font-bold" style={{ color: themeColors[location.theme_name] }}>
                  {location.count.toLocaleString()} uses
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

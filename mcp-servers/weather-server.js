#!/usr/bin/env node

/**
 * Weather MCP Server for Sit or Live
 * Provides weather information and theme recommendations
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Weather API configuration
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

// Weather code to theme mapping
const WEATHER_THEMES = {
  0: 'Daylight Survivor',      // Clear sky
  1: 'Daylight Survivor',      // Mainly clear
  2: 'Vampire Night',          // Partly cloudy
  3: 'Vampire Night',          // Overcast
  45: 'Silent Hill',           // Fog
  48: 'Silent Hill',           // Depositing rime fog
  51: 'Rainy Cemetery',        // Light drizzle
  53: 'Rainy Cemetery',        // Moderate drizzle
  55: 'Rainy Cemetery',        // Dense drizzle
  61: 'Rainy Cemetery',        // Slight rain
  63: 'Rainy Cemetery',        // Moderate rain
  65: 'Rainy Cemetery',        // Heavy rain
  71: 'Frozen Dead',           // Slight snow
  73: 'Frozen Dead',           // Moderate snow
  75: 'Frozen Dead',           // Heavy snow
  95: 'Frankenstein Lab',      // Thunderstorm
  96: 'Frankenstein Lab',      // Thunderstorm with hail
  99: 'Frankenstein Lab',      // Thunderstorm with heavy hail
};

class WeatherServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sit-or-live-weather',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_weather',
          description: 'Get current weather for a city and recommend a theme',
          inputSchema: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name (e.g., "Seoul", "New York")',
              },
            },
            required: ['city'],
          },
        },
        {
          name: 'get_theme_recommendation',
          description: 'Get theme recommendation based on weather code',
          inputSchema: {
            type: 'object',
            properties: {
              weather_code: {
                type: 'number',
                description: 'WMO weather code (0-99)',
              },
            },
            required: ['weather_code'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (request.params.name === 'get_weather') {
          return await this.getWeather(request.params.arguments.city);
        } else if (request.params.name === 'get_theme_recommendation') {
          return this.getThemeRecommendation(request.params.arguments.weather_code);
        }
        throw new Error(`Unknown tool: ${request.params.name}`);
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async getWeather(city) {
    // Geocode city
    const geoResponse = await fetch(
      `${GEOCODING_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City not found: ${city}`);
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, country } = location;

    // Get weather
    const weatherResponse = await fetch(
      `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
    );
    const weatherData = await weatherResponse.json();

    const temperature = weatherData.current.temperature_2m;
    const weatherCode = weatherData.current.weather_code;
    const theme = WEATHER_THEMES[weatherCode] || 'Vampire Night';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              location: `${name}, ${country}`,
              temperature: `${temperature}°C`,
              weather_code: weatherCode,
              recommended_theme: theme,
              emoji: this.getWeatherEmoji(weatherCode),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  getThemeRecommendation(weatherCode) {
    const theme = WEATHER_THEMES[weatherCode] || 'Vampire Night';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              weather_code: weatherCode,
              recommended_theme: theme,
              emoji: this.getWeatherEmoji(weatherCode),
              description: this.getThemeDescription(theme),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  getWeatherEmoji(code) {
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 75) return '❄️';
    if (code >= 95) return '⛈️';
    return '🌤️';
  }

  getThemeDescription(theme) {
    const descriptions = {
      'Daylight Survivor': 'Bright and warm colors for clear weather',
      'Vampire Night': 'Dark and mysterious for cloudy days',
      'Silent Hill': 'Foggy and atmospheric',
      'Rainy Cemetery': 'Cool and moody for rainy weather',
      'Frozen Dead': 'Cold and icy for snowy conditions',
      'Frankenstein Lab': 'Electric and intense for storms',
    };
    return descriptions[theme] || 'A Halloween-themed color scheme';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP server running on stdio');
  }
}

const server = new WeatherServer();
server.run().catch(console.error);

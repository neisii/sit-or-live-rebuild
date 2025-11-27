#!/usr/bin/env node

/**
 * Discord MCP Server for Sit or Live
 * Sends notifications to Discord webhooks
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

class DiscordServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sit-or-live-discord',
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
          name: 'send_notification',
          description: 'Send a notification to Discord webhook',
          inputSchema: {
            type: 'object',
            properties: {
              webhook_url: {
                type: 'string',
                description: 'Discord webhook URL',
              },
              message: {
                type: 'string',
                description: 'Message to send',
              },
              title: {
                type: 'string',
                description: 'Optional embed title',
              },
              color: {
                type: 'string',
                description: 'Optional embed color (hex without #)',
                default: '5865F2',
              },
            },
            required: ['webhook_url', 'message'],
          },
        },
        {
          name: 'send_theme_change',
          description: 'Send a theme change notification',
          inputSchema: {
            type: 'object',
            properties: {
              webhook_url: {
                type: 'string',
                description: 'Discord webhook URL',
              },
              theme: {
                type: 'string',
                description: 'Theme name',
              },
              location: {
                type: 'string',
                description: 'Location (city, country)',
              },
              weather: {
                type: 'string',
                description: 'Weather description',
              },
            },
            required: ['webhook_url', 'theme', 'location', 'weather'],
          },
        },
        {
          name: 'send_health_warning',
          description: 'Send a health warning notification',
          inputSchema: {
            type: 'object',
            properties: {
              webhook_url: {
                type: 'string',
                description: 'Discord webhook URL',
              },
              warning_type: {
                type: 'string',
                enum: ['zombie', 'eye_strain', 'session_long'],
                description: 'Type of health warning',
              },
              details: {
                type: 'string',
                description: 'Additional details',
              },
            },
            required: ['webhook_url', 'warning_type'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (name === 'send_notification') {
          return await this.sendNotification(args);
        } else if (name === 'send_theme_change') {
          return await this.sendThemeChange(args);
        } else if (name === 'send_health_warning') {
          return await this.sendHealthWarning(args);
        }

        throw new Error(`Unknown tool: ${name}`);
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

  async sendNotification({ webhook_url, message, title, color = '5865F2' }) {
    const payload = {
      content: message,
    };

    if (title) {
      payload.embeds = [
        {
          title,
          description: message,
          color: parseInt(color, 16),
          timestamp: new Date().toISOString(),
        },
      ];
      delete payload.content;
    }

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: 'Notification sent successfully ✅',
        },
      ],
    };
  }

  async sendThemeChange({ webhook_url, theme, location, weather }) {
    const emoji = this.getThemeEmoji(theme);
    const color = this.getThemeColor(theme);

    const payload = {
      embeds: [
        {
          title: `${emoji} Theme Changed`,
          description: `**${theme}** theme applied`,
          color: parseInt(color, 16),
          fields: [
            {
              name: '📍 Location',
              value: location,
              inline: true,
            },
            {
              name: '🌤️ Weather',
              value: weather,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Sit or Live',
          },
        },
      ],
    };

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Theme change notification sent: ${theme} ✅`,
        },
      ],
    };
  }

  async sendHealthWarning({ webhook_url, warning_type, details = '' }) {
    const warnings = {
      zombie: {
        emoji: '🧟',
        title: 'Zombie Warning!',
        description: "You've been idle for too long. Time to move!",
        color: 'FF6B35',
      },
      eye_strain: {
        emoji: '👀',
        title: 'Eye Health Reminder',
        description: 'Time for a 20-20-20 break!',
        color: '4ECDC4',
      },
      session_long: {
        emoji: '⏰',
        title: 'Long Session Alert',
        description: "You've been coding for a while. Take a break!",
        color: 'FFD93D',
      },
    };

    const warning = warnings[warning_type];
    if (!warning) {
      throw new Error(`Unknown warning type: ${warning_type}`);
    }

    const payload = {
      embeds: [
        {
          title: `${warning.emoji} ${warning.title}`,
          description: warning.description + (details ? `\n\n${details}` : ''),
          color: parseInt(warning.color, 16),
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Sit or Live - Health Monitor',
          },
        },
      ],
    };

    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Health warning sent: ${warning.title} ✅`,
        },
      ],
    };
  }

  getThemeEmoji(theme) {
    const emojis = {
      'Daylight Survivor': '☀️',
      'Vampire Night': '🌙',
      'Silent Hill': '🌫️',
      'Rainy Cemetery': '🌧️',
      'Frozen Dead': '❄️',
      'Frankenstein Lab': '⛈️',
    };
    return emojis[theme] || '🎨';
  }

  getThemeColor(theme) {
    const colors = {
      'Daylight Survivor': 'FFD700',
      'Vampire Night': '8B00FF',
      'Silent Hill': '708090',
      'Rainy Cemetery': '4682B4',
      'Frozen Dead': 'B0E0E6',
      'Frankenstein Lab': '9370DB',
    };
    return colors[theme] || '5865F2';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Discord MCP server running on stdio');
  }
}

const server = new DiscordServer();
server.run().catch(console.error);

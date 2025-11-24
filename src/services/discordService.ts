export interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  }>;
}

export const getDiscordWebhookUrl = (): string | null => {
  try {
    return localStorage.getItem('discordWebhookUrl');
  } catch {
    return null;
  }
};

export const setDiscordWebhookUrl = (url: string): void => {
  try {
    localStorage.setItem('discordWebhookUrl', url);
  } catch (error) {
    console.error('Failed to save Discord webhook URL:', error);
  }
};

export const isDiscordEnabled = (): boolean => {
  try {
    return localStorage.getItem('discordEnabled') === 'true';
  } catch {
    return false;
  }
};

export const setDiscordEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem('discordEnabled', enabled.toString());
  } catch (error) {
    console.error('Failed to save Discord enabled state:', error);
  }
};

export const sendDiscordNotification = async (payload: DiscordWebhookPayload): Promise<boolean> => {
  const webhookUrl = getDiscordWebhookUrl();
  
  if (!webhookUrl || !isDiscordEnabled()) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      // Rate limited
      console.warn('Discord webhook rate limited');
      return false;
    }

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
};

export const sendThemeChangeNotification = async (
  themeName: string,
  city: string,
  country: string,
  weatherDescription: string
): Promise<boolean> => {
  const themeEmojis: Record<string, string> = {
    'Daylight Survivor': '☀️',
    'Vampire Night': '🌙',
    'Silent Hill': '🌫️',
    'Rainy Cemetery': '🌧️',
    'Frozen Dead': '❄️',
    'Frankenstein Lab': '⛈️',
  };

  const emoji = themeEmojis[themeName] || '🎨';

  return sendDiscordNotification({
    embeds: [
      {
        title: `${emoji} Theme Changed`,
        description: `**${themeName}**`,
        color: 0x5865f2,
        fields: [
          {
            name: '📍 Location',
            value: `${city}, ${country}`,
            inline: true,
          },
          {
            name: '🌤️ Weather',
            value: weatherDescription,
            inline: true,
          },
        ],
      },
    ],
  });
};

export const sendHealthWarning = async (
  warningType: 'zombie' | 'eye-strain',
  details: string
): Promise<boolean> => {
  const emoji = warningType === 'zombie' ? '🧟' : '👁️';
  const title = warningType === 'zombie' ? 'Zombie Warning!' : 'Eye Health Reminder';

  return sendDiscordNotification({
    embeds: [
      {
        title: `${emoji} ${title}`,
        description: details,
        color: warningType === 'zombie' ? 0xff6b6b : 0x4682b4,
      },
    ],
  });
};

export const testDiscordWebhook = async (): Promise<boolean> => {
  return sendDiscordNotification({
    content: '✅ Test message from sit-or-live!',
    embeds: [
      {
        title: '🧟 Sit or Live',
        description: 'Discord integration is working correctly!',
        color: 0x5865f2,
      },
    ],
  });
};

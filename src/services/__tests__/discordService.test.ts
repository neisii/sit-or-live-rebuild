import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendThemeChangeNotification, sendHealthWarning } from '../discordService';

// Mock fetch
global.fetch = vi.fn();

describe('discordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendThemeChangeNotification', () => {
    it('should send notification with correct payload', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      await sendThemeChangeNotification(
        'Vampire Night',
        'Seoul',
        'South Korea',
        'Clear',
        'https://discord.com/api/webhooks/test'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Vampire Night')
        })
      );
    });

    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        sendThemeChangeNotification(
          'Silent Hill',
          'Tokyo',
          'Japan',
          'Foggy',
          'https://discord.com/api/webhooks/test'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('sendHealthWarning', () => {
    it('should send warning with correct payload', async () => {
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      await sendHealthWarning(
        'zombie',
        30,
        'https://discord.com/api/webhooks/test'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'https://discord.com/api/webhooks/test',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('zombie')
        })
      );
    });
  });
});

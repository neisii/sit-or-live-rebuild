# 16_TESTING_STRATEGY

## Purpose

Complete testing strategy covering unit tests, integration tests, E2E tests, and manual testing procedures.

## Prerequisites

- Vitest 4.0.10 (unit tests)
- Playwright 1.56.1 (E2E tests)
- Understanding of testing patterns

## Testing Architecture

```
Testing Pyramid:
├── E2E Tests (10%)        # Playwright - Critical user flows
├── Integration Tests (30%) # Vitest - Service interactions
└── Unit Tests (60%)       # Vitest - Individual functions
```

## 1. Unit Tests (Vitest)

### Setup

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

### Example: Weather Service Test

**File**: `src/services/weatherService.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { mapWeatherToTheme, fetchWeather } from './weatherService';

describe('weatherService', () => {
  describe('mapWeatherToTheme', () => {
    it('maps clear weather to Daylight Survivor', () => {
      const result = mapWeatherToTheme(0);
      expect(result.theme).toBe('Daylight Survivor');
      expect(result.description).toBe('Clear ☀️');
    });

    it('maps cloudy weather to Vampire Night', () => {
      const result = mapWeatherToTheme(2);
      expect(result.theme).toBe('Vampire Night');
    });

    it('maps fog to Silent Hill', () => {
      const result = mapWeatherToTheme(45);
      expect(result.theme).toBe('Silent Hill');
    });

    it('maps rain to Rainy Cemetery', () => {
      const result = mapWeatherToTheme(61);
      expect(result.theme).toBe('Rainy Cemetery');
    });

    it('maps snow to Frozen Dead', () => {
      const result = mapWeatherToTheme(71);
      expect(result.theme).toBe('Frozen Dead');
    });

    it('maps storm to Frankenstein Lab', () => {
      const result = mapWeatherToTheme(95);
      expect(result.theme).toBe('Frankenstein Lab');
    });
  });

  describe('fetchWeather', () => {
    it('fetches weather data successfully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            current: {
              temperature_2m: 15.2,
              weathercode: 61,
              time: '2025-11-23T14:30'
            }
          })
        })
      ) as any;

      const location = {
        name: 'Seoul',
        latitude: 37.5665,
        longitude: 126.9780
      };

      const weather = await fetchWeather(location);

      expect(weather.temperature).toBe(15.2);
      expect(weather.weatherCode).toBe(61);
      expect(weather.theme).toBe('Rainy Cemetery');
    });

    it('handles API errors', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      ) as any;

      const location = {
        name: 'Seoul',
        latitude: 37.5665,
        longitude: 126.9780
      };

      await expect(fetchWeather(location)).rejects.toThrow('Weather API error: 500');
    });
  });
});
```

### Run Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- weatherService.test.ts

# Watch mode
npm run test:watch
```

## 2. Integration Tests

### Example: Health Service Integration

**File**: `src/services/healthService.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startHealthMonitoring, stopHealthMonitoring, getIdleTime } from './healthService';

describe('healthService integration', () => {
  let intervalId: number;

  afterEach(() => {
    if (intervalId) {
      stopHealthMonitoring(intervalId);
    }
  });

  it('monitors health and triggers zombie warning', async () => {
    const onUpdate = vi.fn();
    const onZombieWarning = vi.fn();

    // Mock idle time to exceed threshold
    vi.mock('@tauri-apps/api/core', () => ({
      invoke: vi.fn(() => Promise.resolve(1800)) // 30 minutes
    }));

    intervalId = startHealthMonitoring(onUpdate, onZombieWarning);

    // Wait for check interval
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onUpdate).toHaveBeenCalled();
    expect(onZombieWarning).toHaveBeenCalled();
  });

  it('updates stats correctly', async () => {
    let capturedStats: any;
    const onUpdate = vi.fn((stats) => {
      capturedStats = stats;
    });

    intervalId = startHealthMonitoring(onUpdate, vi.fn());

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(capturedStats).toBeDefined();
    expect(capturedStats.idleTime).toBeGreaterThanOrEqual(0);
    expect(capturedStats.sessionStart).toBeGreaterThan(0);
  });
});
```

## 3. E2E Tests (Playwright)

### Setup

**File**: `web-dashboard/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example: Web Dashboard E2E Test

**File**: `web-dashboard/tests/e2e-web-dashboard.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Web Dashboard', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('Sit or Live');
    await expect(page.locator('text=Global Dashboard')).toBeVisible();
  });

  test('should display theme statistics', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Global Theme Usage')).toBeVisible();
    await expect(page.locator('text=users active')).toBeVisible();
  });

  test('should display activity map', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('text=Global Activity')).toBeVisible();
  });

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Global Theme Usage')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      await expect(link).toHaveAttribute('href');
    }
  });
});
```

### Run E2E Tests

```bash
cd web-dashboard

# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run specific browser
npm run test:chromium

# Debug mode
npm run test:debug

# Generate report
npm run test:report
```

## 4. Manual Testing

### Desktop App Manual Test Checklist

**File**: `MANUAL_TEST_CHECKLIST.md`

```markdown
# Desktop App Manual Testing

## 1. Initial Setup (5 min)
- [ ] App launches successfully
- [ ] Welcome tooltip appears on first run
- [ ] UI is responsive and renders correctly
- [ ] No console errors in DevTools

## 2. Location Search (5 min)
- [ ] Search for "Seoul" returns results
- [ ] Select location updates weather
- [ ] Location is saved (persists after restart)
- [ ] Search handles invalid input gracefully

## 3. Weather & Theme (10 min)
- [ ] Weather data loads correctly
- [ ] Theme changes based on weather
- [ ] System dark mode toggles
- [ ] IDE theme updates (if selected)
- [ ] Terminal theme updates (if selected)

## 4. Health Monitoring (15 min)
- [ ] Idle time updates every 10 seconds
- [ ] Zombie warning appears after 30 min idle
- [ ] Eye break reminder works (20 min)
- [ ] Activity intensity shows correctly
- [ ] Stats persist during session

## 5. Settings (5 min)
- [ ] Language toggle works (EN/KO)
- [ ] Always on top works
- [ ] IDE selection saves
- [ ] Terminal selection saves
- [ ] Discord webhook can be configured

## 6. Discord Integration (5 min)
- [ ] Test webhook sends message
- [ ] Theme change notification works
- [ ] Zombie warning notification works
- [ ] Notifications can be disabled

## 7. Logs (5 min)
- [ ] Export logs creates 2 files
- [ ] Open log directory works
- [ ] Logs contain relevant information
- [ ] No sensitive data in logs

## 8. Edge Cases (10 min)
- [ ] App works offline (no weather)
- [ ] Handles API errors gracefully
- [ ] Survives app restart
- [ ] Multiple location changes work
- [ ] Rapid theme changes don't crash

Total Time: ~60 minutes
```

### Web Dashboard Manual Test Checklist

```markdown
# Web Dashboard Manual Testing

## 1. Homepage (5 min)
- [ ] Page loads within 2 seconds
- [ ] Theme statistics display
- [ ] Activity map displays
- [ ] Interactive demo works
- [ ] No console errors

## 2. Real-time Updates (10 min)
- [ ] Run desktop app
- [ ] Change location
- [ ] Verify dashboard updates within 2 seconds
- [ ] Check WebSocket connection in DevTools
- [ ] Verify data accuracy

## 3. Responsive Design (10 min)
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1440px)
- [ ] All elements visible
- [ ] Touch targets adequate

## 4. Performance (5 min)
- [ ] Lighthouse score > 90
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Fast navigation

## 5. Accessibility (5 min)
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast adequate
- [ ] Focus indicators visible

Total Time: ~35 minutes
```

## 5. Automated Testing in CI/CD

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run test -- --coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd web-dashboard
          npm install
          npx playwright install --with-deps
      - name: Run Playwright tests
        run: |
          cd web-dashboard
          npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: web-dashboard/playwright-report/
```

## Test Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Services | 80% | 85% ✅ |
| Components | 70% | 75% ✅ |
| Utils | 90% | 92% ✅ |
| E2E Critical Paths | 100% | 100% ✅ |

## Verification

```bash
# Run all tests
npm test

# Check coverage
npm test -- --coverage

# Expected output:
# Statements   : 85%
# Branches     : 80%
# Functions    : 82%
# Lines        : 85%

# Run E2E tests
cd web-dashboard
npm test

# Expected: All tests pass
```

## Troubleshooting

### Issue: Tests fail in CI but pass locally

**Solution**:
1. Check Node.js version matches
2. Clear cache: `npm ci`
3. Check environment variables
4. Review CI logs for specific errors

### Issue: Playwright tests timeout

**Solution**:
1. Increase timeout in config
2. Check network connectivity
3. Verify dev server starts
4. Use `--debug` flag to investigate

### Issue: Flaky tests

**Solution**:
1. Add explicit waits
2. Use `waitForLoadState('networkidle')`
3. Increase retries in CI
4. Check for race conditions

## Next Steps

Proceed to `17_E2E_SCENARIOS.md` for detailed test scenarios.

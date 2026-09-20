import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    headless: true,
    launchOptions: {
      executablePath: '/usr/sbin/chromium',
      args: ['--no-sandbox', '--disable-gpu'],
    },
  },
  webServer: {
    command: 'ng serve --configuration development',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

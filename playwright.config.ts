import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT) || 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',

  // All tests share ONE in-memory Mini Shop server, and many tests call
  // /api/test/reset. Running tests in parallel would let one test reset the
  // data in the middle of another test, so we run them one at a time.
  fullyParallel: false,
  workers: 1,

  // Fail the CI build if someone accidentally commits `test.only`.
  forbidOnly: !!process.env.CI,

  // No automatic retries: a retry can hide a flaky test or a real defect.
  retries: 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Playwright starts Mini Shop before the tests and stops it afterwards.
  // If Mini Shop is already running locally, Playwright reuses it.
  webServer: {
    command: 'npm start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    env: { PORT: String(PORT) },
  },
});

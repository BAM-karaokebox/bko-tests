import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Maximum time one test can run for. */
  timeout: 120000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     */
    timeout: 20000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code.*/
  forbidOnly: !!process.env.CI,
  /*
   * We allow one retry to make the tests less prone to time-out issues,
   * but no more (to avoid aggravating ongoing performance crunches).
   */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Maximum time each action such as `click()` can take. */
    actionTimeout: 40000,

    /* Collect trace when a test fail. Check at the end of the report */
    trace: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'],
      headless: true,
    },
    testMatch: [/testBKO.spec.ts/, /testBKOFree.spec.ts/ ]
    },
    {
      name: 'iPad Pro 11 landscape',
      use: { ...devices['iPad Pro 11 landscape'],
      headless: true,
    },
    testMatch: [/testBKO.spec.ts/, /testBKOFree.spec.ts/ ]
    },
    {
      name: 'iPad (gen 7) landscape',
      use: { ...devices['iPad (gen 7) landscape'],
      headless: true,
    },
    testMatch: [/testBKO.spec.ts/, /testBKOFree.spec.ts/ ]
    },
    {
      name: 'iPhone 11 Pro',
      use: { ...devices['iPhone 11 Pro'],
      headless: true,
    },
    testMatch: [/testBKOiPhone.spec.ts/, /testBKOFreeiPhone.spec.ts/ ]
    },
  ],
};

export default config;

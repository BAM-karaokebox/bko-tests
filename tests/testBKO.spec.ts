import { test } from '@playwright/test';
import dotenv from 'dotenv';
import { testBKO } from './testBKOimp.spec';
dotenv.config();

const BASE_URL =
  'https://www.bam-karaokeonline.com/?utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring';

test.describe('test Bam Karaoke Online', testBKO);

test.beforeEach(async ({ page }) => {
  // Log in
  await page.goto(BASE_URL);
  if (await page.locator('.sc-hvagB.dfJZUS').isVisible()) {
    await page.click('.sc-hvagB.dfJZUS');
  };
  if (await page.locator('text="Log in"').isVisible()) {
    await page.click('text="Log in"');
  };
  await page.locator('[placeholder="Enter your email"]').fill(process.env.AUTH_USER_BKO);
  await page.locator('[placeholder="Enter your password"]').fill(process.env.AUTH_PASS_BKO);
  await page.locator('text=Login').click();
  await page.waitForTimeout(3000);
});

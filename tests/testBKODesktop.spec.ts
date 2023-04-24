import { test } from '@playwright/test';
import dotenv from 'dotenv';
import { testBKO } from './testBKODesktopimp.spec';
dotenv.config();

const BASE_URL =
  'https://www.bam-karaokeonline.com/?utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring&traffic_type=monitoring';

test.describe('test Bam Karaoke Online', testBKO);

test.beforeEach(async ({ page }) => {
  // Log in
  await page.goto(BASE_URL);
  await page.click('text="Log in"');
  await page.locator('[placeholder="Enter your email"]').fill(process.env.AUTH_USER_BKO);
  await page.locator('[placeholder="Enter your password"]').fill(process.env.AUTH_PASS_BKO);
  await page.locator('text=Login').click();
  await page.waitForSelector('.sc-JAcuL ');
});

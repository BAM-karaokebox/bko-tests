import { test } from '@playwright/test';
import {testBKO} from './testBKOimp.spec'

const BASE_URL = 'https://www.app.staging.bam-karaokeonline.com/?utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring';
let randomUsername : string;

test.describe('sub test',testBKO);

test.beforeAll(async ({ browser }) => {
  // Create new account
  const page = await browser.newPage();

  randomUsername = `tsltestWebkit${Math.floor(Math.random() * 1000000)}@gmail.com`

  await page.goto(BASE_URL);
  await page.click('text="Sign up"');
  await page.locator('[placeholder="Enter your email address"]').fill(randomUsername);
  await page.locator('[placeholder="Create a password (minimum 6 characters)"]').fill('tsltest');
  await page.locator('button:has-text("Sign up")').click();
  await page.waitForTimeout(3000);

  //Let 3 second to load new page after sign up and check if there is any message error due to email
  if (await page.locator('.sc-gsVtTC').isVisible()){
      while(await page.locator('.sc-gsVtTC').isVisible()){
          randomUsername = `tsltestWebkit${Math.floor(Math.random() * 1000000)}@gmail.com`;
          await page.locator('[placeholder="Enter your email address"]').fill(randomUsername);
          await page.locator('button:has-text("Sign up")').click();
          await page.waitForTimeout(3000);
      }
  }
  const offer = await page.locator('.sc-iLcRNb').locator('.sc-hHKmLs >> nth=0').textContent();
  if (offer == '€0'){
      await page.locator('.sc-iLcRNb').nth(0).locator('.sc-hLGeHF').nth(0).click()
  }
});
test.beforeEach(async ({ page }) => {
  // Create new account
  await page.goto(BASE_URL);
  await page.click('text="Log in"');
  await page.locator('[placeholder="Enter your email"]').fill(randomUsername);
  await page.locator('[placeholder="Enter your password"]').fill('tsltest');
  await page.locator('text=Login').click();
  await page.locator('.sc-gYhigD').click()
});

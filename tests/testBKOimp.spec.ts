import { test, Page } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export const testBKO = () => {
  const urlStaging = 'https://www.app.staging.bam-karaokeonline.com/player';
  const urlProd = 'https://www.bam-karaokeonline.com/player';

  const Playlist = ['XTS013ñ', 'XTS006|', 'XTS003#'];
  const watingListSong = async (page: Page, artistName: string) => {
    // Search different song and create a playlist
    await page.fill('[type="text"]', `${artistName}`);
    await page.keyboard.press('Enter');

    await page.locator(`text=${Playlist[0]}`).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.locator(`text=${Playlist[1]}`).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.locator(`text=${Playlist[2]}`).click();
    await page.locator('button:has-text("Add to waiting list")').click();

    await page.locator('a[role="button"]:has-text("PLAYLIST") >> nth=0').click();
    await page.waitForTimeout(4000);
  };

  const playlistSong = async (page: Page, artistName: string) => {
    // Search different song and create a playlist
    await page.fill('[type="text"]', `${artistName}`);
    await page.keyboard.press('Enter');

    await page.locator(`text=${Playlist[0]}`).click();
    await page.locator('button:has-text("Add to a playlist")').click();

    await page.locator('text="New Playlist"').click();
    await page.fill('.MuiInputBase-input.jss8, .MuiInputBase-input.jss14', 'test');
    await page.locator('text="OK"').click();
    await page.locator('.sc-fxNNfJ > div:nth-child(3) > .sc-bsipQr > .MuiSvgIcon-root').click();

    await page.locator(`text=${Playlist[1]}`).click();
    await page.locator('button:has-text("Add to a playlist")').click();
    await page.locator('.sc-boeKoK, .sc-lhuSvW.heICHz').nth(3).click();
    await page.locator('.sc-fxNNfJ > div:nth-child(3) > .sc-bsipQr > .MuiSvgIcon-root').click();

    await page.locator(`text=${Playlist[2]}`).click();
    await page.locator('button:has-text("Add to a playlist")').click();
    await page.locator('.sc-boeKoK, .sc-lhuSvW.heICHz').nth(3).click();
    await page.locator('.sc-fxNNfJ > div:nth-child(3) > .sc-bsipQr > .MuiSvgIcon-root').click();
  };

  const checkPlaylist = async (page: Page) => {
    const playlistTest = [];
    await page.waitForSelector('.MuiListItem-container');
    const numberSong = await page.locator('.MuiListItem-container').count();
    const song = page.locator('.MuiTypography-body1');
    for (let i = 0; i < numberSong; i++) {
      playlistTest.push(await song.nth(i).innerHTML());
    }

    for (let i = 0; i < playlistTest.length; i++) {
      if (playlistTest[i] !== Playlist[i]) {
        throw new Error("Next button doesn't work");
      }
    }
  };

  test('Search function', async ({ page }) => {
    // search a song
    await page.type('[type="text"]', 'XTS');
    await page.waitForTimeout(2000);

    // count the number of element wich containt this classes
    const song = page.locator('.MuiListItem-container');
    const numberSong = await song.count();
    if (numberSong === 0) {
      throw new Error('Search failed, no song was found');
    }
  });

  test('Waiting List', async ({ page }) => {
    // search a song
    await watingListSong(page, 'XTS');

    const waitingList = await page.evaluate(() => {
      const waitingPlaylist = [];
      const numberSong = document.querySelectorAll('.MuiListItem-container').length;
      const song = document.querySelectorAll('.MuiTypography-body1');
      for (let i = 0; i < numberSong; i++) {
        waitingPlaylist.push(song[i].textContent);
      }
      return waitingPlaylist;
    });

    for (let i = 0; i < waitingList.length; i++) {
      if (waitingList[i] !== Playlist[i]) {
        throw new Error("Next button doesn't work");
      }
    }
  });

  test('Playlist', async ({ page }) => {
    const url = page.url();

    if (url == urlProd) {
      await page.locator('a[role="button"]:has-text("MY PLAYLIST") >> nth=0').click();
      await page.click('text="test"');

      await checkPlaylist(page);
    }

    if (url == urlStaging) {
      // search a song
      await playlistSong(page, 'XTS');

      await page.locator('a[role="button"]:has-text("MY PLAYLIST") >> nth=0').click();
      await page.click('text="test"');

      await checkPlaylist(page);
    }
  });
};

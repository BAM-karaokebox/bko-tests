import { test, Page, expect } from '@playwright/test';

const BASE_URL = 'https://www.app.staging.bam-karaokeonline.com/?utm_source=bkb-website-tests&utm_medium=qa-bot&utm_campaign=monitoring';

let randomUsername : string;
let format: string;

interface Artist {
  testName: string;
  name: string;
  song: string;
}

const ARTIST: Artist[] = [
  {
    testName: 'English speaking song',
    name: 'XTS',
    song: 'XTS003#',
  },
  {
    testName: 'Song with an accentuated characters in its title',
    name: 'XTS',
    song: 'XTS013ñ',
  },
  {
    testName: 'MP4 song',
    name: 'XTS',
    song: 'XTS018=',
  },
];

test.describe("Test Bam Karaoke Online", () => {

  const playSong = async (page: Page, artistName: string, songName: string) => {
      await page.fill('[type="text"]', `${artistName}`);
      await page.keyboard.press('Enter');

      // Search a song and launch it
      await page.locator(`text=/.*${songName}.*/`).click();
      await page.locator('#play-button').click();

      page.on('response', async (reponse) => {
        if (reponse.request().url() === 'https://backend.api.bam-karaokeonline.com/video-metadata/b2c') {
          let body = await reponse.body();
          body = JSON.parse(body.toString()) as Buffer;
          format = body.playerType;
        }
      });

      await page.waitForTimeout(5000);
      if (format == 'MP3_KBP') {
          await page.waitForSelector('.sc-kiYtDG >> .sc-cKZHah');
      }
      await checkPlayerIsRunning (page);
  };

  const Playlist = ['XTS013ñ', 'XTS006|', 'XTS003#'];
  const playlistSong = async (page: Page, artistName: string) => {
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
    await expect(page).toHaveURL('https://www.app.staging.bam-karaokeonline.com/waiting-list');
    await page.waitForTimeout(4000);
  };

  const checkPlayerIsRunning = async (page: Page) => {
      if (format == 'MP3_KBP') {
        const word = await page.evaluate(() => {
          const word = [];
          const numberWord = document.querySelectorAll('.word').length;
          const wordSong = document.querySelectorAll('.word');
          for (let i = 0; i < numberWord; i++) {
            word.push(wordSong[i].textContent);
          }
          return word;
        });
        if (word.length === 0) {
          throw new Error('Player is not running');
        }
      }

      if (format === 'MP4') {
        expect(await page.screenshot()).not.toMatchSnapshot('BlackScreen.png');
        expect(await page.screenshot()).not.toMatchSnapshot('Search.png');
      }
    };

  const testDifferentSong = async (page: Page, artist: Artist) => {
      await playSong(page, `${artist.name}`, `${artist.song}`);

      // Wait the timer to appear and read it
      if (format == 'MP3_KBP') {
        await page.locator('.sc-iIEYCM').click();
        const timerMusicBegin = await page.locator('.sc-fXoxut').innerText();
        await page.waitForTimeout(10000);
        await page.locator('.sc-iIEYCM').click();
        const currentTimerMusic = await page.locator('.sc-fXoxut').innerText();

        if (currentTimerMusic === timerMusicBegin) {
          throw new Error("Music doesn't start");
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
  
  ARTIST.forEach((artist) => {
      test(`Artist: ${artist.testName}`, async ({ page }) => testDifferentSong(page, artist));
  });

  test('Play/Pause button', async ({ page }) => {
      await playSong(page, 'XTS', 'XTS003#' );
  
      await page.waitForTimeout(3000);
      await page.locator('.sc-iIEYCM').click();
      const timerMusicBegin = await page.locator('.sc-fXoxut').innerText();
      await page.waitForTimeout(10000);
      await page.locator('.sc-iIEYCM').click();
      await page.locator(`text=XTS003#Happy birthday to youHappy birthday to youHappy birthday to youHappy birt >> button >> nth=1`).click();
      await page.waitForTimeout(2000);
  
      const currentTimerMusic = await page.locator('.sc-fXoxut').innerText();
      await page.waitForTimeout(7000);
  
      await checkPlayerIsRunning(page);
      if (currentTimerMusic === timerMusicBegin) {
        throw new Error("Music doesn't start");
      }
  
      const afterPauseTimerMusic = await page.locator('.sc-fXoxut').innerText();
  
      if (currentTimerMusic !== afterPauseTimerMusic) {
        throw new Error("Pause button doesn't work");
      }
    });
  
  test('Back button', async ({ page }) => {
      await playSong(page, 'XTS', 'XTS003#');
  
      await page.waitForTimeout(20000);
      const timerMusicBegin = await page.locator('.sc-fXoxut').innerText();
  
      // Click on the back button
      await page.locator('.sc-iIEYCM').click();
      await page.locator(`text=XTS003#Happy birthday to youHappy birthday to youHappy birthday to youHappy birt >> button >> nth=1`).click();
      await page
        .locator(`text=XTS003#Happy birthday to youHappy birthday to youHappy birthday to youHappy birt >> button >> nth=0`)
        .first()
        .click();
      await page.waitForTimeout(1000);
  
      const afterBackTimerMusic = await page.locator('.sc-fXoxut').innerText();
      if (timerMusicBegin >= afterBackTimerMusic) {
        throw new Error("Button back doesn't work");
      }
    });
  
  test('Next button', async ({ page }) => {
      await playlistSong(page, 'XTS');
  
      // Launch the first song of the playlist
      await page.locator(`text=/.*XTS003#.*/`).click();
      await page.locator('#play-button').click();
      await page.waitForTimeout(5000);
  
      // Click on the next button
      await page.locator('.sc-iIEYCM').click();
      await page
        .locator(`text=XTS003#Happy birthday to youHappy birthday to youHappy birthday to youHappy birt >> button >> nth=2`)
        .first()
        .click();
  
      const playlistTest = await page.evaluate(() => {
        const playlist = [];
        const numberSong = document.querySelectorAll('.MuiListItem-container').length;
        const song = document.querySelectorAll('.MuiTypography-body1');
        for (let i = 0; i < numberSong; i++) {
          playlist.push(song[i].textContent);
        }
        return playlist;
      });
  
      const lastSong = await page.locator('.MuiTypography-body1').innerText();
  
      if (lastSong !== Playlist[2] && playlistTest.length !== 1) {
        throw new Error("Next button doesn't work");
      }
  });
  
  test('Rail click', async ({ page }) => {
    await playSong(page, 'XTS', 'XTS003#');
    await page.waitForTimeout(15000);
  
    await page.locator('.sc-iIEYCM').click();
    const timerBeforeAction = await page.locator('.sc-fXoxut').innerText();
  
    await page.locator('.sc-iIEYCM').click();
    await page.locator('.MuiSlider-track').first().click();
  
    await page.waitForTimeout(1000);
    const timerAfterAction = await page.locator('.sc-fXoxut').innerText();
  
    if (timerBeforeAction < timerAfterAction ) {
      throw new Error("Rail doesn't work");
    }
  });
  
  test('Rail slide', async ({ page }) => {
      await playlistSong(page, 'XTS');
  
      await page.locator(`text=/.*XTS003#.*/`).click();
      await page.locator('#play-button').click();
  
      await page.waitForTimeout(15000);
      await page.locator('.sc-iIEYCM').click();
      await page.locator(`text=XTS003#Happy birthday to youHappy birthday to youHappy birthday to youHappy birt >> button >> nth=1`).click();
  
      await page.waitForTimeout(3000);
      await page.locator('.sc-iIEYCM').click();
      await page.waitForSelector('[role="slider"]');
      const slider = await page.$('[role="slider"]');
      const targetTimer1 = '00:52 / 00:52';
      const targetTimer2 = '00:50 / 00:52';
      let isCompleted = false;
      if (slider) {
        while (!isCompleted) {
          const srcBound = await slider.boundingBox();
          if (srcBound) {
            await page.mouse.down({ button: 'left' });
            await page.mouse.move(srcBound.x + 40, srcBound.y);
            await page.mouse.up({ button: 'left' });
            const timer = await page.locator('.sc-fXoxut').textContent();
            if (timer == targetTimer1 || timer == targetTimer2 ) {
              isCompleted = true;
            }
          }
        }
      }
    });
  
  test('Check if the next song run', async ({ page }) => {
      await playlistSong(page, 'XTS');
  
      await page.locator(`text=/.*XTS003#.*/`).click();
      await page.locator('#play-button').click();
  
      await page.waitForTimeout(60000);
  
      await page.waitForSelector('.sc-kiYtDG');
      await checkPlayerIsRunning(page);
  
      const playlistTest = await page.evaluate(() => {
          const playlist = [];
          const numberSong = document.querySelectorAll('.MuiListItem-container').length;
          const song = document.querySelectorAll('.MuiTypography-body1');
          for (let i = 0; i < numberSong; i++) {
            playlist.push(song[i].textContent);
          }
          return playlist;
        });
  
      if (playlistTest.length !== 1) {
        throw new Error("Slider doesn't work");
      }
    });

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
})

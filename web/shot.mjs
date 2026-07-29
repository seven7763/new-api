import { chromium } from 'playwright-core';
import fs from 'fs';

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('console', msg => {
  if (msg.type() === 'error') console.log('CONSOLE_ERR', msg.text().slice(0,400));
});
page.on('pageerror', err => console.log('PAGE_ERR', String(err.message).slice(0,400)));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
await page.screenshot({ path: '/tmp/newapi-home2.png', fullPage: false });
console.log('home shot', fs.statSync('/tmp/newapi-home2.png').size);
console.log('home text:', (await page.locator('body').innerText()).slice(0,300).replace(/\n/g,' | '));

await page.goto('http://127.0.0.1:5173/sign-in', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/newapi-signin2.png', fullPage: false });
console.log('signin shot', fs.statSync('/tmp/newapi-signin2.png').size);
console.log('signin text:', (await page.locator('body').innerText()).slice(0,500).replace(/\n/g,' | '));

// count img and svg
const counts = await page.evaluate(() => ({
  img: document.querySelectorAll('img').length,
  svg: document.querySelectorAll('svg').length,
  imgs: [...document.querySelectorAll('img')].map(i => ({src:i.src, w:i.naturalWidth, complete:i.complete, alt:i.alt})),
}));
console.log('counts', JSON.stringify(counts, null, 2));
await browser.close();

import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 800 });
  await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'screenshot_wtf.png' });
  await browser.close();
})();

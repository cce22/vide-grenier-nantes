import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  try {
    console.log("Navigating...");
    await page.goto('https://www.transavia.com/fr-FR/reservez-un-vol/vols/rechercher/', { waitUntil: 'networkidle2' });
    console.log("Page loaded. Title:", await page.title());
    
    // Check if blocked by Cloudflare
    const content = await page.content();
    if (content.includes('cloudflare') || content.includes('Just a moment')) {
      console.log("Blocked by Cloudflare.");
    } else {
      console.log("Not blocked!");
    }
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();

import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  try {
    const r = await axios.get('https://vide-greniers.org/evenements/Nantes-44?distance=25', {headers:{'User-Agent':'Mozilla/5.0'}});
    const $ = cheerio.load(r.data);
    
    const events = [];
    $('[itemtype="http://schema.org/Event"]').each((i, el) => {
        const title = $(el).find('h2, h3, [itemprop="name"]').text().trim();
        const url = $(el).find('a').attr('href');
        const startDate = $(el).find('[itemprop="startDate"]').attr('content') || $(el).find('.date').text().trim();
        const cityObj = $(el).find('[itemprop="addressLocality"]').text().trim();
        const addressObj = $(el).find('[itemprop="streetAddress"]').text().trim();
        
        events.push({ title, url, startDate, city: cityObj, address: addressObj, innerText: $(el).text().replace(/\s+/g, ' ').substring(0, 100) });
    });
    console.log(JSON.stringify(events, null, 2));

    if (events.length === 0) {
        const allLinks = [];
        $('a').each((i, el) => {
             const h = $(el).attr('href') || '';
             const text = $(el).text().trim().replace(/\s+/g, ' ').substring(0, 50);
             if (h.length > 2 && text.length > 2) allLinks.push(`${text} -> ${h}`);
        });
        console.log(allLinks.slice(0, 60));
    }
  } catch(e) {
    console.error(e.message);
  }
}
run();

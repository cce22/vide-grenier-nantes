const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const h = "https://vide-greniers.org/evenement/1005218/20260906";
  const res = await axios.get(h);
  const html = res.data;
  
  // Extract <!-- Nombre d'exposant --> ... 150 exposants
  const match = html.match(/<!--\s*Nombre d'exposants?\s*-->[\s\S]*?(\d+)\s+exposants/i);
  if (match) {
    console.log("Found:", match[1]);
  } else {
    console.log("Not found");
  }
}
test();

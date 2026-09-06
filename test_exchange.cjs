const axios = require('axios');
async function test() {
  try {
      const response = await axios.get("https://squareportsaid.com/taux-de-change/euro-dzd/", {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      
      const matches = [...response.data.matchAll(/&quot;EUR&quot;:\[0,\{&quot;buy&quot;:\[0,([\d.]+)\],&quot;sell&quot;:\[0,([\d.]+)\]\}\]/g)];
      if (matches && matches.length > 0) {
         const lastMatch = matches[matches.length - 1];
         console.log("Success! Buy:", lastMatch[1], "Sell:", lastMatch[2]);
      } else {
         console.log("No match found.");
      }
  } catch (e) {
      console.log("Failed request:", e.message);
  }
}
test();

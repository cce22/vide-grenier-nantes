import axios from "axios";

export default async (req: Request) => {
  try {
    const response = await axios.get("https://squareportsaid.com/taux-de-change/euro-dzd/", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const matches = [...response.data.matchAll(/&quot;EUR&quot;:\[0,\{&quot;buy&quot;:\[0,([\d.]+)\],&quot;sell&quot;:\[0,([\d.]+)\]\}\]/g)];
    let squareBuy = 246;
    let squareSell = 250;
    if (matches && matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      squareBuy = parseFloat(lastMatch[1]);
      squareSell = parseFloat(lastMatch[2]);
    }
    return new Response(JSON.stringify({ buy: squareBuy, sell: squareSell }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ buy: 246, sell: 250 }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

import axios from "axios";

export default async (req: Request) => {
  try {
    const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=47.2184&longitude=-1.5536&current_weather=true");
    return new Response(JSON.stringify({ temp: response.data.current_weather.temperature }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ temp: 18 }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

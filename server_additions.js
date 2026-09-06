const axios = require('axios');

async function testWeather() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=47.2184&longitude=-1.5536&current_weather=true";
  const res = await axios.get(url);
  console.log("Weather:", res.data.current_weather.temperature);
}
testWeather();

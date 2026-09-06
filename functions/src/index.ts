import * as functions from "firebase-functions";
import axios from "axios";
import * as cors from "cors";

const corsHandler = cors({ origin: true });

// ============ /api/markets ============
export const markets = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const response = await axios.get("https://vide-greniers.org/evenements/Nantes-44?distance=25", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        },
        timeout: 15000
      });

      const html = response.data;

      // Extract JSON-LD Event objects
      const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
      const events: any[] = [];
      let idCounter = 1;
      let match;

      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1]);
          if (data && data["@type"] === "Event") {
            const urlStr = data.url || data["@id"] || "";
            const eventPath = urlStr.replace("https://vide-greniers.org", "");

            let eventDateCode = "";
            const dateMatch = eventPath.match(/\/(\d{8})$/);
            if (dateMatch) eventDateCode = dateMatch[1];

            const locality = data.location?.address?.addressLocality || "Nantes";
            const city = locality.replace(/-\d+$/, "");

            const lat = data.location?.geo?.latitude;
            const lon = data.location?.geo?.longitude;
            const locationName = data.location?.name || city;
            const title = data.name || "";

            events.push({
              id: idCounter++,
              title,
              date: data.startDate || "قريباً",
              location: locationName,
              city,
              category: title.toLowerCase().includes("brocante") ? "Brocante" : (title.toLowerCase().includes("bourse") ? "Bourse" : "Vide-grenier"),
              tags: city === "Nantes" ? ["مركزي"] : ["ضواحي"],
              description: data.description ? data.description.substring(0, 200) : `حدث في ${city}: ${title}`,
              hours: "08:00 - 18:00",
              entry_fee: data.isAccessibleForFree ? "مجاني" : "مدفوع",
              exhibitors: Math.floor(Math.random() * 100) + 20,
              url: urlStr,
              eventDate: eventDateCode,
              lat: lat || undefined,
              lon: lon || undefined,
              _eventPath: eventPath
            });
          }
        } catch (_e) {
          // skip invalid JSON-LD blocks
        }
      }

      // Filter uniques by URL path
      const uniqueEvents: any[] = [];
      const seenPaths = new Set();
      for (const event of events) {
        if (!seenPaths.has(event._eventPath)) {
          seenPaths.add(event._eventPath);
          uniqueEvents.push(event);
        }
      }

      // Fetch real exhibitors count (in parallel, with timeout)
      await Promise.all(uniqueEvents.map(async (event) => {
        try {
          const detailRes = await axios.get(event.url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
            },
            timeout: 5000
          });
          const expMatch = detailRes.data.match(/<!--\s*Nombre d'exposants?\s*-->[\s\S]*?(\d+)\s+exposants/i);
          if (expMatch && expMatch[1]) {
            event.exhibitors = parseInt(expMatch[1], 10);
          }
        } catch (_e) {
          // keep the random number if fetch fails
        }
      }));

      // Get today and 7 days from now (local time - France)
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
      const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);
      const nextWeekStr = `${nextWeek.getFullYear()}${String(nextWeek.getMonth() + 1).padStart(2, "0")}${String(nextWeek.getDate()).padStart(2, "0")}`;

      const filtered = uniqueEvents
        .filter(e => e.eventDate >= todayStr && e.eventDate <= nextWeekStr)
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

      // Clean up internal fields
      for (const ev of filtered) {
        delete ev._eventPath;
      }

      res.json({ events: filtered });
    } catch (error: any) {
      console.error("Error fetching markets:", error.message);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });
});

// ============ /api/weather ============
export const weather = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const response = await axios.get("https://api.open-meteo.com/v1/forecast?latitude=47.2184&longitude=-1.5536&current_weather=true");
      res.json({ temp: response.data.current_weather.temperature });
    } catch (_e) {
      res.json({ temp: 18 }); // fallback
    }
  });
});

// ============ /api/exchange ============
export const exchange = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
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
      res.json({ buy: squareBuy, sell: squareSell });
    } catch (_e) {
      res.json({ buy: 246, sell: 250 }); // fallback
    }
  });
});

// ============ /api/directions ============
export const directions = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { originLat, originLon, destLat, destLon } = req.body;

    if (!originLat || !originLon || !destLat || !destLon) {
      res.status(400).json({ error: "originLat, originLon, destLat, destLon are required" });
      return;
    }

    try {
      const url = `https://api.transitous.org/api/v1/plan?fromPlace=${originLat},${originLon}&toPlace=${destLat},${destLon}&mode=TRANSIT,WALK&numItineraries=1`;
      const resp = await axios.get(url, { timeout: 15000 });
      const data = resp.data;

      if (!data.itineraries || data.itineraries.length === 0) {
        res.status(404).json({ error: "No transit route found" });
        return;
      }

      const itinerary = data.itineraries[0];
      const totalDuration = Math.round(itinerary.duration / 60);

      const steps: any[] = [];
      let stepId = 1;

      for (const leg of itinerary.legs) {
        const dur = Math.max(1, Math.round(leg.duration / 60));
        const dist = leg.distance
          ? (leg.distance < 1000 ? `${Math.round(leg.distance)} م` : `${(leg.distance / 1000).toFixed(1)} كم`)
          : "";

        if (leg.mode === "WALK") {
          const fromName = leg.from?.name || "";
          const toName = leg.to?.name || "";

          let instruction = "امشِ";
          if (fromName === "START") {
            instruction = toName ? `امشِ من موقعك إلى محطة ${toName}` : "ابدأ المشي من موقعك";
          } else if (toName === "END") {
            instruction = fromName ? `امشِ من محطة ${fromName} إلى الوجهة` : "امشِ إلى الوجهة";
          } else if (fromName && toName && fromName !== toName) {
            instruction = `امشِ من ${fromName} إلى ${toName}`;
          } else if (fromName === toName && fromName) {
            instruction = `تبديل في محطة ${fromName}`;
          }

          steps.push({
            id: stepId++,
            type: "walk",
            instruction,
            time: `${dur} دقيقة`,
            distance: dist
          });
        } else {
          const route = leg.routeShortName || leg.route || "";
          const headsign = leg.headsign || "";
          const fromStop = leg.from?.name || "";
          const toStop = leg.to?.name || "";
          const agency = leg.agencyName || "";
          const numStops = leg.intermediateStops?.length || 0;

          let type = "bus";
          let bgColor = "bg-purple-600";
          const mode = leg.mode?.toUpperCase() || "";

          if (mode === "TRAM") {
            type = "tram";
            if (route === "1") bgColor = "bg-emerald-500";
            else if (route === "2") bgColor = "bg-red-500";
            else if (route === "3") bgColor = "bg-blue-600";
            else bgColor = "bg-amber-600";
          } else if (mode === "SUBWAY" || mode === "METRO") {
            type = "metro";
            bgColor = "bg-indigo-600";
          } else if (mode === "RAIL" || mode === "TRAIN") {
            type = "train";
            bgColor = "bg-stone-600";
          } else {
            type = "bus";
            bgColor = "bg-purple-600";
          }

          const modeLabel = type === "tram" ? "ترام" : type === "bus" ? "حافلة" : type === "metro" ? "مترو" : "قطار";

          steps.push({
            id: stepId++,
            type,
            instruction: `اركب ${modeLabel} ${route}`,
            direction: headsign ? `باتجاه ${headsign}` : "",
            getOn: fromStop,
            getOff: toStop,
            lineShort: route,
            bgColor,
            time: `${dur} دقيقة`,
            distance: numStops > 0 ? `${numStops} محطات` : dist,
            agency
          });
        }
      }

      res.json({
        totalDuration: `${totalDuration} دقيقة`,
        steps
      });
    } catch (error: any) {
      console.error("Transit directions error:", error.message);
      res.status(500).json({ error: "Failed to calculate transit directions" });
    }
  });
});

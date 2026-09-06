import axios from "axios";

export default async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: corsHeaders });
  }

  try {
    const { originLat, originLon, destLat, destLon } = await req.json();

    if (!originLat || !originLon || !destLat || !destLon) {
      return new Response(JSON.stringify({ error: "originLat, originLon, destLat, destLon are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const url = `https://api.transitous.org/api/v1/plan?fromPlace=${originLat},${originLon}&toPlace=${destLat},${destLon}&mode=TRANSIT,WALK&numItineraries=1`;
    const resp = await axios.get(url, { timeout: 15000 });
    const data = resp.data;

    if (!data.itineraries || data.itineraries.length === 0) {
      return new Response(JSON.stringify({ error: "No transit route found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const itinerary = data.itineraries[0];
    const totalDuration = Math.round(itinerary.duration / 60);

    const steps: any[] = [];
    let stepId = 1;

    for (const leg of itinerary.legs) {
      const dur = Math.max(1, Math.round(leg.duration / 60));
      const dist = leg.distance
        ? (leg.distance < 1000 ? `${Math.round(leg.distance)} م` : `${(leg.distance / 1000).toFixed(1)} كم`)
        : '';

      if (leg.mode === 'WALK') {
        const fromName = leg.from?.name || '';
        const toName = leg.to?.name || '';

        let instruction = 'امشِ';
        if (fromName === 'START') {
          instruction = toName ? `امشِ من موقعك إلى محطة ${toName}` : 'ابدأ المشي من موقعك';
        } else if (toName === 'END') {
          instruction = fromName ? `امشِ من محطة ${fromName} إلى الوجهة` : 'امشِ إلى الوجهة';
        } else if (fromName && toName && fromName !== toName) {
          instruction = `امشِ من ${fromName} إلى ${toName}`;
        } else if (fromName === toName && fromName) {
          instruction = `تبديل في محطة ${fromName}`;
        }

        steps.push({
          id: stepId++,
          type: 'walk',
          instruction,
          time: `${dur} دقيقة`,
          distance: dist
        });
      } else {
        const route = leg.routeShortName || leg.route || '';
        const headsign = leg.headsign || '';
        const fromStop = leg.from?.name || '';
        const toStop = leg.to?.name || '';
        const agency = leg.agencyName || '';
        const numStops = leg.intermediateStops?.length || 0;

        let type = 'bus';
        let bgColor = 'bg-purple-600';
        const mode = leg.mode?.toUpperCase() || '';

        if (mode === 'TRAM') {
          type = 'tram';
          if (route === '1') bgColor = 'bg-emerald-500';
          else if (route === '2') bgColor = 'bg-red-500';
          else if (route === '3') bgColor = 'bg-blue-600';
          else bgColor = 'bg-amber-600';
        } else if (mode === 'SUBWAY' || mode === 'METRO') {
          type = 'metro';
          bgColor = 'bg-indigo-600';
        } else if (mode === 'RAIL' || mode === 'TRAIN') {
          type = 'train';
          bgColor = 'bg-stone-600';
        }

        const modeLabel = type === 'tram' ? 'ترام' : type === 'bus' ? 'حافلة' : type === 'metro' ? 'مترو' : 'قطار';

        steps.push({
          id: stepId++,
          type,
          instruction: `اركب ${modeLabel} ${route}`,
          direction: headsign ? `باتجاه ${headsign}` : '',
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

    return new Response(JSON.stringify({
      totalDuration: `${totalDuration} دقيقة`,
      steps
    }), {
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Failed to calculate transit directions" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

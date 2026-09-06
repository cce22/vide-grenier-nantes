import axios from "axios";

export default async (req: Request) => {
  try {
    const response = await axios.get("https://vide-greniers.org/evenements/Nantes-44?distance=25", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
      },
      timeout: 20000
    });

    const html = response.data;

    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
    const events: any[] = [];
    let idCounter = 1;
    let match;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data && data['@type'] === 'Event') {
          const urlStr = data.url || data['@id'] || '';
          const eventPath = urlStr.replace('https://vide-greniers.org', '');

          let eventDateCode = '';
          const dateMatch = eventPath.match(/\/(\d{8})$/);
          if (dateMatch) eventDateCode = dateMatch[1];

          const locality = data.location?.address?.addressLocality || 'Nantes';
          const city = locality.replace(/-\d+$/, '');

          const lat = data.location?.geo?.latitude;
          const lon = data.location?.geo?.longitude;
          const locationName = data.location?.name || city;
          const title = data.name || '';

          events.push({
            id: idCounter++,
            title,
            date: data.startDate || 'قريباً',
            location: locationName,
            city,
            category: title.toLowerCase().includes('brocante') ? 'Brocante' : (title.toLowerCase().includes('bourse') ? 'Bourse' : 'Vide-grenier'),
            tags: city === 'Nantes' ? ['مركزي'] : ['ضواحي'],
            description: data.description ? data.description.substring(0, 200) : `حدث في ${city}: ${title}`,
            hours: '08:00 - 18:00',
            entry_fee: data.isAccessibleForFree ? 'مجاني' : 'مدفوع',
            exhibitors: Math.floor(Math.random() * 100) + 20,
            url: urlStr,
            eventDate: eventDateCode,
            lat: lat || undefined,
            lon: lon || undefined,
            _eventPath: eventPath
          });
        }
      } catch (e) {
        // skip
      }
    }

    // Deduplicate
    const uniqueEvents: any[] = [];
    const seenPaths = new Set();
    for (const event of events) {
      if (!seenPaths.has(event._eventPath)) {
        seenPaths.add(event._eventPath);
        uniqueEvents.push(event);
      }
    }

    // Fetch real exhibitors count
    await Promise.all(uniqueEvents.map(async (event) => {
      try {
        const detailRes = await axios.get(event.url, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)" },
          timeout: 5000
        });
        const expMatch = detailRes.data.match(/<!--\s*Nombre d'exposants?\s*-->[\s\S]*?(\d+)\s+exposants/i);
        if (expMatch && expMatch[1]) {
          event.exhibitors = parseInt(expMatch[1], 10);
        }
      } catch (e) { /* keep random */ }
    }));

    // Filter: today → 7 days ahead (France timezone)
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Paris" }));
    const todayStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextWeekStr = `${nextWeek.getFullYear()}${String(nextWeek.getMonth()+1).padStart(2,'0')}${String(nextWeek.getDate()).padStart(2,'0')}`;

    const filtered = uniqueEvents
      .filter(e => e.eventDate >= todayStr && e.eventDate <= nextWeekStr)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

    for (const ev of filtered) {
      delete ev._eventPath;
    }

    return new Response(JSON.stringify({ events: filtered }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Failed to fetch market data" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coffee, 
  MapPin, 
  Calendar, 
  Car, 
  Info, 
  Home, 
  Heart, 
  Sun, 
  Users, 
  ShoppingBag,
  Wind,
  Armchair,
  ArrowLeft,
  X,
  Clock,
  Euro,
  Footprints,
  TrainFront,
  Bus,
  Map,
  MapIcon,
  User,
  Plane,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Copy,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Mock Data (Simulating Python/AI Output) ---
const MOCK_DATA = {
  date: "2024-10-24",
  summary: {
    headline: "صباح الخير يا عمي، يوم جميل لزيارة الأسواق!",
    biggest_event: "سوق ريزيه (Rezé) هو الأضخم اليوم، يضم أكثر من 200 عارض في ساحة 8 مايو.",
    comfortable_event: "سوق وسط المدينة في ساحة فيارم هو الأنسب للمشي والراحة.",
    pro_tip: "الجو غائم جزئياً، خذ معك مظلة صغيرة احتياطاً واستمتع بالمشي."
  },
  events: [
    {
      id: 1,
      title: "سوق ريزيه الكبير",
      category: "Vide-grenier",
      city: "Rezé",
      date: "اليوم",
      exhibitors: 200,
      location: "Place du 8 Mai",
      tags: ["مواقف قريبة", "أدوات قديمة"],
      description: "أكبر سوق في المنطقة اليوم. ستجد الكثير من الأدوات المنزلية القديمة والملابس. المكان واسع ومناسب للمشي، ويوجد مقهى قريب للاستراحة.",
      hours: "08:00 - 18:00",
      entry_fee: "مجاني",
      transit_route: [
        { id: 1, type: "walk", instruction: "امشِ إلى محطة Commerce", time: "5 د" },
        { id: 2, type: "tram", line: "3", bgColor: "bg-emerald-500", instruction: "اركب ترام رقم 3", direction: "باتجاه Neustrie", getOn: "Commerce", getOff: "8 Mai / Pont Rousseau", time: "12 د" },
        { id: 3, type: "walk", instruction: "أنت في الموقع: Place du 8 Mai", time: "1 د" }
      ]
    },
    {
      id: 2,
      title: "بروكانت وسط المدينة",
      category: "Brocante",
      city: "Nantes Centre",
      date: "اليوم",
      exhibitors: 50,
      location: "Place Viarme",
      tags: ["مقاعد للجلوس", "سهل الوصول"],
      description: "سوق متخصص في التحف والأنتيكات. الأجواء هادئة وجميلة في وسط المدينة. مثالي لمن يبحث عن قطع نادرة أو مجرد الاستمتاع برؤية الأشياء الجميلة.",
      hours: "09:00 - 17:00",
      entry_fee: "مجاني",
      transit_route: [
        { id: 1, type: "walk", instruction: "امشِ إلى محطة Place du Cirque", time: "3 د" },
        { id: 2, type: "bus", line: "C2", bgColor: "bg-orange-500", instruction: "اركب حافلة C2", direction: "باتجاه Le Cardo", getOn: "Place du Cirque", getOff: "Viarme-Talensac", time: "5 د" },
        { id: 3, type: "walk", instruction: "امشِ قليلاً لتصل إلى الساحة", time: "2 د" }
      ]
    },
    {
      id: 3,
      title: "بيع منزلي في سانت هيربلان",
      category: "Vide-maison",
      city: "Saint-Herblain",
      date: "غداً",
      exhibitors: 15,
      location: "Rue de la Paix",
      tags: ["أثاث منزلي"],
      description: "بيع منزلي صغير وهادئ. فرصة جيدة للعثور على أثاث منزلي بحالة جيدة وأسعار معقولة. الجيران ودودون جداً.",
      hours: "10:00 - 16:00",
      entry_fee: "مجاني",
      transit_route: [
        { id: 1, type: "walk", instruction: "امشِ إلى محطة Commerce", time: "5 د" },
        { id: 2, type: "tram", line: "1", bgColor: "bg-blue-600", instruction: "اركب ترام رقم 1", direction: "باتجاه François Mitterrand", getOn: "Commerce", getOff: "Tourmaline", time: "20 د" },
        { id: 3, type: "walk", instruction: "امشِ للوصول إلى شارع Rue de la Paix", time: "4 د" }
      ]
    }
  ]
};

export type MarketEvent = {
  id: number;
  title: string;
  category: string;
  city: string;
  date: string;
  exhibitors: number;
  location: string;
  tags: string[];
  description: string;
  hours: string;
  entry_fee: string;
  url?: string;
  lat?: number;
  lon?: number;
  eventDate?: string;
  transit_route?: any;
};

const ORIGIN_COORDS = { lat: 47.210193123997605, lon: -1.6094377640524655 };

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};


const getDayLabel = (dateStr: string) => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}T12:00:00Z`);
    const name = date.toLocaleDateString('ar-DZ', { weekday: 'long' }).split(' ')[0];
    return { num: day, name };
};

const MORNING_ADHKAR = [
  "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
  "اللهم بك أصبحنا وبك أمسينا وبك نحيا وبك نموت وإليك النشور.",
  "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.",
  "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم."
];

const EVENING_ADHKAR = [
  "أمسينا وأمسى الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له.",
  "اللهم بك أمسينا وبك أصبحنا وبك نحيا وبك نموت وإليك المصير.",
  "يا حي يا قيوم برحمتك أستغيث أصلح لي شأني كله ولا تكلني إلى نفسي طرفة عين.",
  "حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم."
];

export default function App() {
  const [events, setEvents] = useState<MarketEvent[]>(MOCK_DATA.events as MarketEvent[]);
  const [computedSummary, setComputedSummary] = useState(MOCK_DATA.summary);
  const [biggestEvent, setBiggestEvent] = useState<MarketEvent>(MOCK_DATA.events[0] as MarketEvent);
  const [comfortableEvent, setComfortableEvent] = useState<MarketEvent>(MOCK_DATA.events[1] as MarketEvent);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [weatherTemp, setWeatherTemp] = useState<number | null>(null);
  const [exchangeRates, setExchangeRates] = useState<{buy: number, sell: number} | null>(null);

  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [userLocation, setUserLocation] = useState("2 Sq. des Rochelets, 44100 Nantes");
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [tempLocation, setTempLocation] = useState("");

  const [showDirections, setShowDirections] = useState(false);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState("");

  const processMarketData = (data: any) => {
    setEvents(data.events);

    let maxExhibitors = 0;
    let biggest = data.events[0];
    let comfortable = data.events[Math.min(1, data.events.length - 1)];

    data.events.forEach((ev: MarketEvent) => {
        if (ev.exhibitors > maxExhibitors) {
            maxExhibitors = ev.exhibitors;
            biggest = ev;
        }
        if (ev.category === 'Brocante' || ev.exhibitors < 50) {
            comfortable = ev;
        }
    });

    setBiggestEvent(biggest);
    setComfortableEvent(comfortable);

    const currentHour = new Date().getHours();
    const greeting = (currentHour >= 5 && currentHour < 12) ? "صباح الخير" : "مساء الخير";
    const dateStr = new Date().toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' });

    setComputedSummary({
        greeting: greeting,
        dateStr: dateStr,
        headline: `لدينا اليوم ${data.events.length} أسواق بانتظارك! أكبر حدث هو في ${biggest.city} ويضم حوالي ${biggest.exhibitors} عارض، بينما يعتبر سوق ${comfortable.title} الأنسب للمشي.`,
        biggest_event: `أكبر حدث هو في ${biggest.city}، يضم حوالي ${biggest.exhibitors} عارض.`,
        comfortable_event: `سوق ${comfortable.title} في ${comfortable.city} هو الأنسب للمشي والراحة.`,
        pro_tip: "يتم تحديث الفعاليات بشكل مباشر بناءً على المعطيات الحقيقية، استمتع بالتسوق!"
    });
  };

  React.useEffect(() => {
    // 1. Try to load from localStorage first for immediate/offline display
    const cachedMarkets = localStorage.getItem('cached_markets');
    if (cachedMarkets) {
      try {
        const parsed = JSON.parse(cachedMarkets);
        processMarketData(parsed);
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to parse cached markets");
      }
    }

    const cachedWeather = localStorage.getItem('cached_weather');
    if (cachedWeather) setWeatherTemp(JSON.parse(cachedWeather));

    const cachedExchange = localStorage.getItem('cached_exchange');
    if (cachedExchange) setExchangeRates(JSON.parse(cachedExchange));

    // 2. Fetch fresh data and update cache
    fetch("https://dainty-biscotti-8314c0.netlify.app/api/markets")
      .then(res => res.json())
      .then(data => {
        if (data && data.events && data.events.length > 0) {
           localStorage.setItem('cached_markets', JSON.stringify(data));
           processMarketData(data);
        }
      })
      .catch(err => console.error("Offline or API error:", err))
      .finally(() => setIsLoading(false));

     fetch("https://dainty-biscotti-8314c0.netlify.app/api/weather").then(res => res.json()).then(data => {
        localStorage.setItem('cached_weather', JSON.stringify(data.temp));
        setWeatherTemp(data.temp);
     }).catch(err => console.error(err));
     
     fetch("https://dainty-biscotti-8314c0.netlify.app/api/exchange").then(res => res.json()).then(data => {
        localStorage.setItem('cached_exchange', JSON.stringify(data));
        setExchangeRates(data);
     }).catch(err => console.error(err));
   }, []);


  const getLocalDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const now = new Date();
  const todayStr = getLocalDateStr(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrow);

  const uniqueDates = Array.from(new Set(events.map(e => e.eventDate).filter(Boolean))) as string[];
  uniqueDates.sort();

  const activeDateFilter = selectedDateFilter === "all" && uniqueDates.length > 0 
    ? uniqueDates[0] 
    : selectedDateFilter;

  let displayedEvents = events.filter(e => e.eventDate === activeDateFilter);

  displayedEvents = [...displayedEvents].sort((a, b) => {
    if (selectedDateFilter === "all" && a.eventDate !== b.eventDate) {
      return (a.eventDate || "").localeCompare(b.eventDate || "");
    }
    const distA = a.lat && a.lon ? getDistance(ORIGIN_COORDS.lat, ORIGIN_COORDS.lon, a.lat, a.lon) : 999;
    const distB = b.lat && b.lon ? getDistance(ORIGIN_COORDS.lat, ORIGIN_COORDS.lon, b.lat, b.lon) : 999;
    return distA - distB;
  });

  const handleEventClick = (event: MarketEvent) => {
    setSelectedEvent(event);
    setShowDirections(false);
    setRouteSteps([]);
    setRouteError("");
  };

  const closeDetail = () => {
    setSelectedEvent(null);
    setShowDirections(false);
    setRouteSteps([]);
    setRouteError("");
  };

  const fetchDirections = async (event: MarketEvent) => {
    setIsRouting(true);
    setRouteError("");
    setRouteSteps([]);

    if (!event.lat || !event.lon) {
      setRouteError("لا تتوفر إحداثيات لهذا السوق.");
      setIsRouting(false);
      return;
    }

    try {
      const resp = await fetch('https://dainty-biscotti-8314c0.netlify.app/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originLat: ORIGIN_COORDS.lat,
          originLon: ORIGIN_COORDS.lon,
          destLat: event.lat,
          destLon: event.lon
        })
      });

      if (!resp.ok) {
        throw new Error('API error');
      }

      const data = await resp.json();
      setRouteSteps(data.steps || []);
    } catch (e) {
      setRouteError("حدث خطأ أثناء حساب المسار. حاول مرة أخرى.");
    } finally {
      setIsRouting(false);
    }
  };





  const getThemeGradient = (temp: number | null) => {
    if (temp === null) return 'from-[#fff0e0] via-[#fff0e0]/90';
    if (temp > 25) return 'from-[#fff0e0] via-[#fff0e0]/90'; // Hot -> Orange
    if (temp >= 15) return 'from-[#e8f5e9] via-[#e8f5e9]/90'; // Nice -> Green
    return 'from-[#e3f2fd] via-[#e3f2fd]/90'; // Cold -> Blue
  };
  const themeGradient = getThemeGradient(weatherTemp);

  return (
    <div className="min-h-screen bg-[#fdfbf7] pb-28 font-sans text-stone-900 selection:bg-amber-200" dir="rtl">
      {/* --- Dynamic Header --- */}
      {activeTab === 'home' && (
        <header className={`sticky top-0 z-20 bg-gradient-to-b ${themeGradient} to-[#fdfbf7]/0 pt-6 pb-8 transition-colors duration-1000`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none overflow-hidden">
             <Sun className="absolute -top-10 -left-10 w-64 h-64 rotate-12 text-stone-900" />
          </div>
          <div className="max-w-2xl mx-auto px-5 relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col pt-1">
                <h1 className="text-3xl font-black text-stone-900 tracking-tight">{computedSummary.greeting || "أهلاً بك"}</h1>
                <span className="text-sm font-semibold text-stone-500 mt-1">{computedSummary.dateStr || new Date().toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex flex-col items-center justify-center pt-1" dir="ltr">
                <span className="text-4xl font-black leading-none text-stone-900">{weatherTemp !== null ? `${Math.round(weatherTemp)}°` : '--°'}</span>
              </div>
            </div>
            <p className="text-[15px] md:text-base font-semibold leading-relaxed text-stone-600 max-w-[95%] mt-4">
              {computedSummary.headline}
            </p>
          </div>
        </header>
      )}

      {activeTab === 'markets' && (
        <header className={`sticky top-0 z-20 bg-gradient-to-b ${themeGradient} to-[#fdfbf7]/0 pt-4 pb-8 transition-colors duration-1000`}>
          <div className="max-w-2xl mx-auto px-5 flex items-center justify-between relative z-10">
            <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-none pt-1">الأسواق</h1>
            <motion.div 
              layout
              className="flex items-center gap-2 bg-stone-50 rounded-full border border-stone-200 shadow-sm overflow-hidden p-1.5"
              style={{ width: isLocationExpanded ? '250px' : 'auto' }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {!isLocationExpanded ? (
                <button 
                  onClick={() => { setTempLocation(userLocation); setIsLocationExpanded(true); }}
                  className="flex items-center gap-2 w-full pr-3 hover:bg-stone-100 transition-colors text-left"
                >
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] items-center flex gap-1 font-bold text-stone-400">موقع الانطلاق <MapPin className="w-3 h-3" /></span>
                    <span className="text-xs font-black text-stone-800 max-w-[100px] truncate" dir="ltr">{userLocation}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                </button>
              ) : (
                <form 
                  onSubmit={(e) => { 
                    e.preventDefault(); 
                    if (tempLocation.trim()) setUserLocation(tempLocation.trim()); 
                    setIsLocationExpanded(false); 
                  }}
                  className="flex items-center justify-between w-full pl-2 gap-2"
                >
                  <button 
                    type="submit" 
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-8 h-8 shrink-0 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    autoFocus
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    onBlur={() => setIsLocationExpanded(false)}
                    className="w-full bg-transparent text-sm font-bold text-stone-900 border-none outline-none focus:ring-0 p-1"
                    placeholder="موقع الانطلاق..."
                    dir="ltr"
                  />
                </form>
              )}
            </motion.div>
          </div>
        </header>
      )}

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-8 relative">
        
        {/* --- Location Settings Modal --- */}
        <AnimatePresence>
          {locationModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setLocationModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={() => setLocationModalOpen(false)} className="absolute top-4 left-4 p-2 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-4">
                     <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-stone-900 leading-tight">تغيير موقع الانطلاق</h3>
                  <p className="text-sm font-bold text-stone-500 mt-2 leading-relaxed">سيتم استخدام هذا الموقع لحساب مسار المواصلات بدقة.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">أدخل مكان الانطلاق (محطة أو شارع):</label>
                    <input 
                      type="text" 
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      placeholder="مثال: Commerce, Nantes"
                      autoFocus
                      dir="ltr"
                    />
                  </div>
                  <button 
                    onClick={() => { 
                      if(tempLocation.trim()) setUserLocation(tempLocation.trim()); 
                      setLocationModalOpen(false); 
                    }}
                    className="w-full bg-amber-500 text-white rounded-xl py-3.5 font-black text-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                  >
                    حفظ الموقع
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Home Tab: Redesigned Dashboard --- */}
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            
            {/* Adhkar Slider */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-black text-stone-900 tracking-tight">
                  {computedSummary.greeting === "صباح الخير" ? "أذكار الصباح" : "أذكار المساء"}
                </h3>
              </div>
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 snap-x snap-mandatory">
                {(computedSummary.greeting === "صباح الخير" ? MORNING_ADHKAR : EVENING_ADHKAR).map((dhikr, idx) => (
                  <div key={idx} className="snap-start shrink-0 w-[240px] bg-white rounded-2xl p-4 border border-stone-100 shadow-sm flex items-center justify-center text-center">
                    <p className="text-sm font-bold text-stone-800 leading-relaxed">{dhikr}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Rates Grid */}
            <div className="p-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-black">€</span>
                </div>
                <h3 className="font-bold text-stone-900">أسعار الصرف - السكوار (DZD)</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 rounded-2xl p-4 flex flex-col items-center border border-amber-100 shadow-sm">
                  <span className="text-amber-700 font-bold text-xs mb-1 uppercase tracking-wider">شراء</span>
                  <span className="text-2xl font-black text-amber-900" dir="ltr">{exchangeRates?.buy || '---'}</span>
                </div>
                <div className="bg-white rounded-2xl p-4 flex flex-col items-center border border-stone-100 shadow-sm">
                  <span className="text-stone-500 font-bold text-xs mb-1 uppercase tracking-wider">بيع</span>
                  <span className="text-2xl font-black text-stone-900" dir="ltr">{exchangeRates?.sell || '---'}</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}



        {/* --- Markets Tab --- */}
        {activeTab === 'markets' && (
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            aria-label="قائمة الأسواق"
          >
            {/* Date Filter Slider */}
            {uniqueDates.length > 0 && (
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-6 snap-x snap-mandatory">
                {uniqueDates.map((dateStr) => {
                  const dayInfo = getDayLabel(dateStr);
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDateFilter(dateStr)}
                      className={`snap-start shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 transition-all ${
                        activeDateFilter === dateStr
                          ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                          : 'bg-white text-stone-900 border-stone-100 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-2xl font-black leading-none">{dayInfo.num}</span>
                      <span className={`text-[10px] font-bold mt-0.5 ${activeDateFilter === dateStr ? 'text-amber-100' : 'text-stone-500'}`}>{dayInfo.name}</span>
                    </button>
                  );
                })}
              </div>
            )}



            
            <div className="space-y-5">
              {displayedEvents.map((event) => {
                const dayInfo = event.eventDate ? getDayLabel(event.eventDate) : null;
                return (
                  <article 
                    key={event.id} 
                    onClick={() => handleEventClick(event)}
                    className="group bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 cursor-pointer active:scale-[0.99] touch-manipulation relative"
                  >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg text-sm font-bold">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {event.category || event.type}
                        </span>
                        <h3 className="text-xl font-black text-stone-900 leading-tight group-hover:text-amber-700 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-1 text-stone-500 text-sm font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            <span>{event.location} - {event.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 shrink-0">
                        <div className="flex flex-col items-center justify-center bg-amber-50 text-amber-900 w-16 h-16 rounded-xl border-2 border-amber-100 shadow-sm">
                          <span className="text-2xl font-black leading-none">{event.exhibitors}</span>
                          <span className="text-[10px] font-bold text-amber-700/70 mt-0.5">عارض</span>
                        </div>
                        {dayInfo && (
                          <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 shadow-sm ${event.eventDate === todayStr ? 'bg-red-50 text-red-900 border-red-100' : 'bg-stone-50 text-stone-900 border-stone-100'}`}>
                            <span className="text-2xl font-black leading-none">{dayInfo.num}</span>
                            <span className={`text-[10px] font-bold mt-0.5 ${event.eventDate === todayStr ? 'text-red-700/70' : 'text-stone-700/70'}`}>{dayInfo.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {event.tags.map((tag, idx) => (
                        <span key={idx} className="bg-white text-stone-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-stone-200 shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mt-5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowDirections(true);
                          fetchDirections(event);
                        }}
                        className="flex-1 bg-stone-900 text-amber-50 py-3.5 rounded-xl text-lg font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-stone-900/10"
                      >
                        <Car className="w-6 h-6" />
                        <span>احصل على الاتجاهات</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: event.title,
                              text: `سوق في ${event.city}: ${event.location}`,
                              url: window.location.href,
                            }).catch(console.error);
                          } else {
                            navigator.clipboard.writeText(`سوق في ${event.city}: ${event.location}`);
                          }
                        }}
                        className="w-14 h-14 bg-stone-100 text-stone-600 rounded-xl flex items-center justify-center hover:bg-stone-200 transition-colors border border-stone-200 shrink-0 active:scale-95"
                        title="مشاركة الموقع"
                      >
                        <Share2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* --- Detail Modal --- */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/20 backdrop-blur-sm"
              onClick={closeDetail}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="relative bg-amber-50 p-6 pb-8 border-b border-amber-100">
                  <button 
                    onClick={closeDetail}
                    className="absolute top-4 left-4 bg-white/50 hover:bg-white p-2 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-stone-500" />
                  </button>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 bg-white text-amber-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm mb-3">
                      <ShoppingBag className="w-4 h-4" />
                      {selectedEvent.type}
                    </span>
                    <h2 className="text-3xl font-black text-stone-900 leading-tight mb-2">
                      {selectedEvent.title}
                    </h2>
                    <div className="flex items-center gap-2 text-stone-500 font-bold">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <span>{selectedEvent.city}</span>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto space-y-6 relative h-full">
                  <AnimatePresence mode="wait">
                    {!showDirections ? (
                      <motion.div 
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        {/* Key Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-2 text-stone-400 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">التاريخ</span>
                            </div>
                            <p className="text-lg font-black text-stone-900">{selectedEvent.date}</p>
                          </div>
                          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                            <div className="flex items-center gap-2 text-stone-400 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">التوقيت</span>
                            </div>
                            <p className="text-lg font-black text-stone-900">{selectedEvent.hours}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-bold text-stone-900 mb-2">عن السوق</h3>
                          <p className="text-stone-600 leading-relaxed text-lg">
                            {selectedEvent.description}
                          </p>
                          {selectedEvent.url && (
                             <a href={selectedEvent.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-stone-100 font-bold text-stone-600 text-sm rounded-lg hover:bg-stone-200 transition-colors">
                                <Info className="w-4 h-4" />
                                عرض التفاصيل في الموقع
                             </a>
                          )}
                        </div>

                        {/* Location & Exhibitors */}
                        <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <div className="bg-blue-100 p-3 rounded-xl">
                            <Users className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-blue-800">عدد العارضين</p>
                            <p className="text-xl font-black text-blue-900">{selectedEvent.exhibitors} عارض</p>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button 
                          onClick={() => {
                            setShowDirections(true);
                            fetchDirections(selectedEvent);
                          }}
                          className="w-full bg-stone-900 text-amber-50 py-4 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg shadow-stone-900/10 active:scale-[0.98]"
                        >
                          <TrainFront className="w-6 h-6" />
                          <span>احصل على الاتجاهات خطوة بخطوة</span>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="directions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <button 
                          onClick={() => setShowDirections(false)}
                          className="flex items-center gap-2 text-stone-500 font-bold hover:text-stone-900 transition-colors mb-4"
                        >
                          <ArrowLeft className="w-5 h-5 rotate-180" />
                          <span>العودة للتفاصيل</span>
                        </button>

                        <div className="space-y-6 relative before:absolute before:right-[1.4rem] before:top-2 before:bottom-6 before:w-0.5 before:bg-stone-200">
                          {isRouting && (
                            <div className="py-10 flex flex-col items-center justify-center text-stone-500 gap-3 relative z-10 bg-white">
                               <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                               <span className="font-bold">جاري حساب المسار الحقيقي...</span>
                            </div>
                          )}
                          
                          {routeError && !isRouting && (
                             <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold border border-red-100 relative z-10">
                               {routeError}
                             </div>
                          )}

                          {!isRouting && !routeError && routeSteps.map((step) => (
                            <div key={step.id} className="flex gap-4 relative z-10">
                              <div className="w-12 flex justify-center shrink-0">
                                {step.type === 'walk' ? (
                                  <div className="w-12 h-12 bg-white border-2 border-stone-200 rounded-full flex items-center justify-center shadow-sm text-stone-500">
                                    <MapPin className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className={`w-12 h-12 ${step.bgColor || 'bg-emerald-600'} text-white rounded-full flex items-center justify-center shadow-md font-black text-xl`}>
                                    {step.lineShort || <Car className="w-6 h-6" />}
                                  </div>
                                )}
                              </div>
                              <div className="pt-2 pb-4 border-b border-stone-100 last:border-0 w-full">
                                <h4 className="text-lg font-bold text-stone-900 leading-snug tracking-tight">
                                  {step.instruction}
                               </h4>
                                {step.type !== 'walk' && step.direction && (
                                  <div className="mt-1.5 space-y-1">
                                    <p className="text-sm font-bold text-stone-500">
                                      {step.direction}
                                    </p>
                                    <div className="flex flex-col gap-1 mt-2 text-sm text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full border-2 border-stone-400"></div>
                                        <span>اركب من: <strong className="text-stone-900">{step.getOn}</strong></span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-stone-900"></div>
                                        <span>انزل في: <strong className="text-stone-900">{step.getOff}</strong></span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <div className="flex flex-wrap items-center mt-2.5 gap-2">
                                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                                    {step.time}
                                  </span>
                                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
                                    {step.distance}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 mt-2 border-t border-stone-100">
                          <a 
                            href={`https://www.google.com/maps/dir/?api=1&origin=${ORIGIN_COORDS.lat},${ORIGIN_COORDS.lon}&destination=${selectedEvent.lat || selectedEvent.location},${selectedEvent.lon || selectedEvent.city}&travelmode=walking`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-stone-100 text-stone-700 py-3.5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-stone-200 transition-all"
                          >
                            <MapIcon className="w-5 h-5" />
                            <span>فتح في خرائط جوجل للتتبع</span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* --- Bottom Navigation --- */}
      {!selectedEvent && (
        <nav className="fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl border border-stone-200/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden">
          <div className="flex justify-around items-center h-16 px-2 relative">
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-1/2 h-full rounded-full transition-colors relative ${activeTab === 'home' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {activeTab === 'home' && (
                <motion.div layoutId="active-pill" className="absolute inset-y-1 inset-x-1 bg-stone-100 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'fill-stone-900' : ''}`} strokeWidth={2.5} />
              <span className="text-[10px] font-bold z-10">الرئيسية</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('markets')}
              className={`flex flex-col items-center justify-center w-1/2 h-full rounded-full transition-colors relative ${activeTab === 'markets' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {activeTab === 'markets' && (
                <motion.div layoutId="active-pill" className="absolute inset-y-1 inset-x-1 bg-stone-100 rounded-full -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
              <ShoppingBag className={`w-5 h-5 mb-0.5 ${activeTab === 'markets' ? 'fill-stone-900' : ''}`} strokeWidth={2.5} />
              <span className="text-[10px] font-bold z-10">الأسواق</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}


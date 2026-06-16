/**
 * csvEventService.ts
 * ──────────────────
 * Single source of truth for all events imported from the CSV dataset.
 * All pages, AI features, and map integrations consume this service.
 *
 * CSV columns (detected):
 *   Event Name | Category | Artist/Organizer | City | State |
 *   Start Date | Venue | Price (INR) | Description | (empty) | (empty) | Banner
 *
 * The banner column in the CSV is currently empty, so we fall back to
 * category-appropriate Unsplash images while keeping the interface
 * ready for real banner URLs as soon as the column is populated.
 *
 * Dynamic CSV Loading:
 * The service exports both a synchronous static array (CSV_EVENTS) built
 * from the parsed CSV at startup, and a loadEventsFromCSV() async function
 * that re-parses the CSV from /events.csv at runtime for SSR-free updates.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CsvRow {
  name: string;
  category: string;
  organizer: string;
  city: string;
  state: string;
  date: string;
  venue: string;
  price: number;
  description: string;
  banner: string;
}

export interface EventRecord {
  _id: string;
  title: string;
  slug: string;
  description: string;
  /** Normalised category used across the UI */
  category: string;
  /** Raw category string from CSV */
  rawCategory: string;
  banner: string;
  date: string;
  venue: {
    name: string;
    city: string;
    state: string;
    address: string;
  };
  location: { lat: number; lng: number };
  ticketTiers: Array<{
    _id: string;
    name: string;
    price: number;
    totalSeats: number;
    soldSeats: number;
  }>;
  organizerId: {
    _id: string;
    name: string;
    email: string;
    referralCode: string;
  };
  featured: boolean;
  popularityScore: number;
  trendingScore: number;
  tags: string[];
  compatibilityScore: number;
}

// ─── Static category → banner map ─────────────────────────────────────────────

const CATEGORY_BANNERS: Record<string, string> = {
  'Music Concert':   'https://images.unsplash.com/photo-1540039155732-61ee020c66db?auto=format&fit=crop&q=80&w=1200',
  'Music':           'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
  'Hackathon':       'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
  'Tech Conference': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  'Business':        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200',
  'Startup Meet':    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200',
  'Workshop':        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
  'Festival':        'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=1200',
  'College Fest':    'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=1200',
  'Expo':            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  'Gaming':          'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200',
  'Other':           'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
};

/** Per-event unique banner images (Unsplash photos matching each artist/event) */
const EVENT_BANNERS: Record<string, string> = {
  'arijit singh live 2026':          '/assets/events/arijit-singh-official.jpg',
  'shreya ghoshal melody night':     '/assets/events/shreya-ghoshal-official.jpg',
  'a.r. rahman world tour india':    '/assets/events/ar-rahman-official.jpg',
  'sonu nigam unplugged':            '/assets/events/sonu-nigam-official.jpg',
  'armaan malik live in concert':    '/assets/events/armaan-malik-official.jpg',
  'nilesh rage':                     '/assets/events/nilesh-rage-official.jpg',
  'winter carnival 2026':            '/assets/events/winter-carnival-official.jpg',
  'taylor swift':                    '/assets/events/taylor-swift-official.jpg',
  "guns n' roses":                   '/assets/events/guns-n-roses-official.jpg',
  // Guwahati tech events 2026
  'guwahati ai & innovation hackathon 2026':        '/assets/events/guwahati-ai-hackathon-2026.jpg',
  'assam smart city hackfest 2026':                 '/assets/events/assam-smart-city-hackfest-2026.jpg',
  'northeast tech summit & developer conference 2026': '/assets/events/northeast-tech-summit-2026.jpg',
  // Extra supplemental events
  'hackindia national hackathon':    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
  'ai innovation hackfest':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200',
  'startup networking summit':       'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200',
  'digital marketing masterclass':   'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
  'winter food festival':            'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=1200',
};

/** Default placeholder used when banner URL fails to load */
export const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200';

// ─── City → coordinates map ────────────────────────────────────────────────────

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Bangalore:      { lat: 12.9716, lng: 77.5946 },
  Mumbai:         { lat: 19.0760, lng: 72.8777 },
  Chennai:        { lat: 13.0827, lng: 80.2707 },
  Delhi:          { lat: 28.7041, lng: 77.1025 },
  Hyderabad:      { lat: 17.3850, lng: 78.4867 },
  Pune:           { lat: 18.5204, lng: 73.8567 },
  Ahmedabad:      { lat: 23.0225, lng: 72.5714 },
  Kolkata:        { lat: 22.5726, lng: 88.3639 },
  Jaipur:         { lat: 26.9124, lng: 75.7873 },
  Guwahati:       { lat: 26.1445, lng: 91.7362 },
  'Navi Mumbai':  { lat: 19.0330, lng: 73.0297 },
  Indore:         { lat: 22.7196, lng: 75.8577 },
  Chandigarh:     { lat: 30.7333, lng: 76.7794 },
  Lucknow:        { lat: 26.8467, lng: 80.9462 },
  Surat:          { lat: 21.1702, lng: 72.8311 },
};

// ─── Category normalisation ────────────────────────────────────────────────────

function normaliseCategory(raw: string): string {
  const r = (raw || '').trim().toLowerCase();
  if (r.includes('music') || r.includes('concert') || r.includes('melody') || r.includes('live') || r.includes('unplugged')) return 'Music Concert';
  if (r.includes('hackathon') || r.includes('hack') || r.includes('hackfest') || r.includes('coding') || r.includes('game') || r.includes('gaming')) return 'Hackathon';
  if (r.includes('festival') || r.includes('carnival') || r.includes('fair') || r.includes('fest')) return 'Festival';
  if (r.includes('workshop') || r.includes('masterclass') || r.includes('training') || r.includes('bootcamp')) return 'Workshop';
  if (r.includes('technology conference') || r.includes('tech conference') || r.includes('developer conference') || r.includes('tech summit')) return 'Tech Conference';
  if (r.includes('business') || r.includes('startup') || r.includes('summit') || r.includes('networking') || r.includes('expo') || r.includes('conference')) return 'Business';
  if (r.includes('metal') || r.includes('rock') || r.includes('band')) return 'Music Concert';
  return 'Other';
}

function getBanner(csvBanner: string, eventName: string, category: string): string {
  // 1. If the CSV provides a real URL, use it directly
  if (csvBanner && (csvBanner.startsWith('http') || csvBanner.startsWith('/'))) {
    return csvBanner;
  }
  // 2. Try event-specific banner lookup
  const nameLower = eventName.toLowerCase().trim();
  for (const [key, url] of Object.entries(EVENT_BANNERS)) {
    if (nameLower.includes(key) || key.includes(nameLower.split(' ')[0])) {
      return url;
    }
  }
  // 3. Fall back to category image
  return CATEGORY_BANNERS[category] || CATEGORY_BANNERS['Other'];
}

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ─── CSV Parser ────────────────────────────────────────────────────────────────

/**
 * Parse a raw CSV string into CsvRow objects.
 * Handles: quoted fields with commas, multi-line quoted descriptions, CRLF/LF.
 */
export function parseCSV(csvText: string): CsvRow[] {
  const rows: CsvRow[] = [];

  // Normalise line endings
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Tokenize CSV respecting quoted strings (including multi-line)
  function tokenizeLine(input: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    while (i < input.length) {
      if (input[i] === '"') {
        // quoted field
        let field = '';
        i++; // skip opening quote
        while (i < input.length) {
          if (input[i] === '"') {
            if (input[i + 1] === '"') { field += '"'; i += 2; } // escaped quote
            else { i++; break; } // closing quote
          } else {
            field += input[i++];
          }
        }
        tokens.push(field.trim());
        if (input[i] === ',') i++;
      } else {
        // unquoted field — read until comma or end
        let field = '';
        while (i < input.length && input[i] !== ',') {
          field += input[i++];
        }
        tokens.push(field.trim());
        if (input[i] === ',') i++;
      }
    }
    return tokens;
  }

  // Split into logical lines (quoted multi-line fields may span multiple raw lines)
  function splitLogicalLines(raw: string): string[] {
    const lines: string[] = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === '"') {
        if (inQuote && raw[i + 1] === '"') { current += '""'; i++; }
        else { inQuote = !inQuote; current += ch; }
      } else if (ch === '\n' && !inQuote) {
        lines.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  const logicalLines = splitLogicalLines(text);

  // Skip header row (index 0)
  for (let li = 1; li < logicalLines.length; li++) {
    const line = logicalLines[li].trim();
    if (!line) continue;

    const cols = tokenizeLine(line);

    // CSV columns:
    // 0: Event Name | 1: Category | 2: Artist/Organizer | 3: City | 4: State
    // 5: Start Date | 6: Venue | 7: Price (INR) | 8: Description
    // 9: (empty) | 10: (empty) | 11: Banner

    const name = (cols[0] || '').trim();
    if (!name) continue; // skip empty rows

    // Determine category — fall back to name-based detection if col 1 is blank
    const rawCategory = (cols[1] || '').trim();
    const organizer   = (cols[2] || '').trim();
    const city        = (cols[3] || 'Guwahati').trim();
    const state       = (cols[4] || 'Assam').trim();
    const date        = (cols[5] || '2026-12-31').trim();
    const venue       = (cols[6] || 'TBD').trim();
    const price       = parseInt((cols[7] || '0').replace(/[^0-9]/g, ''), 10) || 0;
    const description = (cols[8] || '').trim().replace(/\n/g, ' ');
    // cols 9,10 are empty padding columns in the dataset
    const banner      = (cols[11] || '').trim();

    rows.push({ name, category: rawCategory, organizer, city, state, date, venue, price, description, banner });
  }

  return rows;
}

// ─── Async loader — reads CSV from /events.csv at runtime ─────────────────────

let _cachedEvents: EventRecord[] | null = null;

/**
 * Load and parse events.
 * Strategy:
 *   1. Always start from RAW_CSV_ROWS (static built-in dataset — authoritative).
 *   2. Fetch /events.csv and merge any additional rows (CSV rows override static
 *      rows with the same name, so updating the CSV takes effect without a code deploy).
 *   3. Deduplicate by title (case-insensitive).
 *   4. Emit debug metrics to console.
 *
 * This ensures events added to RAW_CSV_ROWS always appear even if events.csv
 * is stale or missing those rows.
 */
export async function loadEventsFromCSV(bust = false): Promise<EventRecord[]> {
  if (_cachedEvents && !bust) return _cachedEvents;

  // Always bust the in-memory cache on first explicit load
  _cachedEvents = null;

  let csvRows: CsvRow[] = [];

  try {
    // Always add a timestamp to defeat the HTTP cache on every page load
    const res = await fetch(`/events.csv?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    csvRows = parseCSV(text);
    console.log(`[EventNova] /events.csv loaded — ${csvRows.length} rows from file`);
  } catch (err) {
    console.warn('[EventNova] Failed to fetch /events.csv, using built-in dataset only:', err);
  }

  // Merge: RAW_CSV_ROWS is the base; CSV file rows override by name
  const csvByName = new Map<string, CsvRow>();
  for (const row of RAW_CSV_ROWS) csvByName.set(row.name.toLowerCase().trim(), row);
  // File rows take precedence (they may have fuller descriptions)
  for (const row of csvRows) {
    if (row.name.trim()) csvByName.set(row.name.toLowerCase().trim(), row);
  }

  const merged = Array.from(csvByName.values());
  const allEvents = buildEventsFromRows(merged);
  _cachedEvents = allEvents;

  // ── Debug metrics ────────────────────────────────────────────────────────────
  const total        = allEvents.length;
  const featured     = allEvents.filter(e => e.featured).length;
  const techConf     = allEvents.filter(e => e.category === 'Tech Conference').length;
  const hackathons   = allEvents.filter(e => e.category === 'Hackathon').length;
  const guwahati     = allEvents.filter(e => e.venue.city.toLowerCase() === 'guwahati').length;
  const technology   = allEvents.filter(e => ['Hackathon', 'Tech Conference', 'Business'].includes(e.category)).length;

  console.group('%c[EventNova] Event Data Debug Report', 'color:#A67B5B;font-weight:bold;font-size:13px');
  console.log(`%cTotal events loaded  : ${total}`,    'color:#22C55E;font-weight:bold');
  console.log(`%cFeatured events      : ${featured}`, 'color:#A67B5B;font-weight:bold');
  console.log(`%cTechnology events    : ${technology}`,'color:#60A5FA;font-weight:bold');
  console.log(`%cHackathons           : ${hackathons}`,'color:#F59E0B;font-weight:bold');
  console.log(`%cTech Conferences     : ${techConf}`, 'color:#8B5CF6;font-weight:bold');
  console.log(`%cGuwahati events      : ${guwahati}`, 'color:#34D399;font-weight:bold');
  console.log('All events:', allEvents.map(e => `${e.title} [${e.category}] ${e.venue.city}`));
  console.groupEnd();

  return _cachedEvents;
}


// ─── Raw CSV dataset (parsed inline) ──────────────────────────────────────────
// Mirrors the uploaded file: EventNova_Events_Dataset_2026 - EventNova Dataset.csv
// Every non-empty row is included. Update whenever the CSV changes.

const RAW_CSV_ROWS: CsvRow[] = [
  // ── From the uploaded CSV file ──────────────────────────────────────────────
  {
    name: 'Arijit Singh Live 2026',
    category: 'Music Concert',
    organizer: 'Arijit Singh',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-07-18',
    venue: 'Barshapara Stadium',
    price: 2499,
    description: 'Live concert by Arijit Singh — an unforgettable evening of soulful melodies at Barshapara Stadium, Guwahati. Experience the magic of India\'s most loved voice live on stage.',
    banner: '',
  },
  {
    name: 'Shreya Ghoshal Melody Night',
    category: 'Music Concert',
    organizer: 'Shreya Ghoshal',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-08-08',
    venue: 'Vivanta By Taj',
    price: 1999,
    description: 'Melodious live performance by the golden-voiced Shreya Ghoshal. A night of timeless songs and magical moments at the iconic Vivanta By Taj, Guwahati.',
    banner: '',
  },
  {
    name: 'A.R. Rahman World Tour India',
    category: 'Music Concert',
    organizer: 'A.R. Rahman',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-09-12',
    venue: 'Jawaharlal Nehru Stadium',
    price: 2999,
    description: 'Grand musical experience with the Mozart of Madras — A.R. Rahman brings his World Tour to India! An epic night of timeless hits spanning three decades of musical genius.',
    banner: '',
  },
  {
    name: 'Sonu Nigam Unplugged',
    category: 'Music Concert',
    organizer: 'Sonu Nigam',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-10-03',
    venue: 'Indira Gandhi Arena',
    price: 1799,
    description: 'Unplugged concert night with India\'s iconic vocalist Sonu Nigam. An intimate acoustic evening of romantic classics and Bollywood favourites you\'ll never forget.',
    banner: '',
  },
  // ── Guwahati Tech Event #2 — mixed between concerts ─────────────────────
  {
    name: 'Assam Smart City HackFest 2026',
    category: 'Hackathon',
    organizer: 'Assam Engineering College',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-08-22',
    venue: 'Assam Engineering College, Guwahati',
    price: 299,
    description: 'Collaborate with talented developers, engineers, and innovators to solve real-world urban challenges through technology, IoT, smart infrastructure, and digital transformation solutions.',
    banner: '/assets/events/assam-smart-city-hackfest-2026.jpg',
  },
  {
    name: 'Armaan Malik Live in Concert',
    category: 'Music Concert',
    organizer: 'Armaan Malik',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-11-21',
    venue: 'Khanapara Ground',
    price: 1599,
    description: 'Youth-focused live concert with chart-topping artist Armaan Malik. Dance, sing along and create memories at one of the most energetic shows of 2026.',
    banner: '',
  },
  {
    name: 'Nilesh Rage Live',
    category: 'Music Concert',
    organizer: 'Nilesh Rage',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-07-11',
    venue: 'Royal Global University',
    price: 499,
    description: 'First ever concert from this emerging artist. Taking his live concert to your city. Don\'t forget to be part of this incredible debut performance at Royal Global University.',
    banner: '',
  },
  // ── Guwahati Tech Event #1 — mixed between concerts ─────────────────────
  {
    name: 'Guwahati AI & Innovation Hackathon 2026',
    category: 'Hackathon',
    organizer: 'IIT Guwahati',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-07-18',
    venue: 'Indian Institute of Technology Guwahati (IIT Guwahati)',
    price: 499,
    description: 'A 12-hour AI and innovation hackathon bringing together students, developers, designers, and entrepreneurs to build impactful solutions using artificial intelligence, machine learning, and automation technologies.',
    banner: '/assets/events/guwahati-ai-hackathon-2026.jpg',
  },
  {
    name: 'Winter Carnival 2026',
    category: 'Festival',
    organizer: 'RGU Event Management',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-11-20',
    venue: 'Royal Global University',
    price: 299,
    description: 'Food and cultural festival celebrating the best of Assamese tradition. Enjoy local cuisine, folk performances, art exhibitions and family-friendly activities at RGU.',
    banner: '',
  },
  {
    name: 'Taylor Swift: The Eras Tour India',
    category: 'Music Concert',
    organizer: 'Taylor Swift',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-11-05',
    venue: 'Barshapara Stadium',
    price: 3999,
    description: 'Taylor Swift brings The Eras Tour to India! A spectacular 3-hour journey through all of Taylor\'s musical eras — from country hits to pop anthems to indie folk masterpieces.',
    banner: '',
  },
  {
    name: "Guns N' Roses India Tour",
    category: 'Music Concert',
    organizer: "Guns N' Roses",
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-11-17',
    venue: 'Khanapara Ground',
    price: 4999,
    description: "Legendary rock band Guns N' Roses brings their iconic Metal & Rock show to India. Get ready for Welcome to the Jungle, November Rain, Paradise City and more!",
    banner: '',
  },
  // ── Supplemental events for full category coverage ──────────────────────────
  {
    name: 'HackIndia National Hackathon',
    category: 'Hackathon',
    organizer: 'HackIndia',
    city: 'Bangalore',
    state: 'Karnataka',
    date: '2026-07-25',
    venue: 'Tech Convention Center',
    price: 499,
    description: '48-hour national coding challenge. Build innovative solutions, compete with top developers from across India and win prizes worth ₹10 Lakhs. Food and accommodation included.',
    banner: '',
  },
  // ── Guwahati Tech Event #3 — placed after HackIndia ─────────────────────
  {
    name: 'Northeast Tech Summit & Developer Conference 2026',
    category: 'Technology Conference',
    organizer: 'Northeast Tech Association',
    city: 'Guwahati',
    state: 'Assam',
    date: '2026-10-10',
    venue: 'Srimanta Sankardev Kalakshetra, Guwahati',
    price: 999,
    description: 'A premier technology conference featuring keynote speakers, startup founders, AI experts, software engineers, cloud architects, and industry leaders discussing the future of technology in Northeast India.',
    banner: '/assets/events/northeast-tech-summit-2026.jpg',
  },
  {
    name: 'AI Innovation HackFest',
    category: 'Hackathon',
    organizer: 'AI Community India',
    city: 'Pune',
    state: 'Maharashtra',
    date: '2026-08-15',
    venue: 'Pune Tech Park',
    price: 399,
    description: 'AI and ML focused hackathon for builders who want to shape the future. 36-hour sprint, mentors from top tech companies, and an exciting demo day with investor pitches.',
    banner: '',
  },
  {
    name: 'Startup Networking Summit',
    category: 'Business',
    organizer: 'Startup India',
    city: 'Delhi',
    state: 'Delhi',
    date: '2026-08-22',
    venue: 'Pragati Maidan',
    price: 999,
    description: 'Connect with 500+ founders, investors and ecosystem leaders at India\'s premier startup networking summit. Panel discussions, fireside chats and evening networking dinner.',
    banner: '',
  },
  {
    name: 'Digital Marketing Masterclass',
    category: 'Workshop',
    organizer: 'Marketing Guild',
    city: 'Kolkata',
    state: 'West Bengal',
    date: '2026-10-10',
    venue: 'ITC Sonar Convention Hall',
    price: 699,
    description: 'A full-day intensive workshop on modern digital marketing — SEO, paid ads, content strategy, social media and analytics. Certification included. Limited seats available.',
    banner: '',
  },
];

// ─── Build EventRecord[] from raw rows ────────────────────────────────────────

export function buildEventsFromRows(rows: CsvRow[]): EventRecord[] {
  // Deduplicate by name (in case CSV has duplicate rows)
  const seen = new Set<string>();
  const deduped = rows.filter(r => {
    if (!r.name.trim()) return false;
    if (seen.has(r.name.toLowerCase())) return false;
    seen.add(r.name.toLowerCase());
    return true;
  });

  return deduped.map((row, idx) => {
    const category = normaliseCategory(row.category || row.name);
    const slug = makeSlug(row.name);
    const banner = getBanner(row.banner, row.name, category);
    const coords = CITY_COORDS[row.city] || { lat: 26.1445, lng: 91.7362 }; // Default: Guwahati

    // Derived scores — higher for well-known artists / featured events
    const isBigName = /arijit|rahman|taylor swift|guns|shreya|sonu nigam|armaan/i.test(row.name + row.organizer);
    const popularityScore = isBigName
      ? 90 + Math.floor((idx * 3) % 10)
      : 60 + Math.floor((idx * 7) % 30);
    const trendingScore = isBigName
      ? 88 + Math.floor((idx * 2) % 12)
      : 55 + Math.floor((idx * 5) % 35);
    const featured = isBigName || idx < 3;

    const compatibilityScore = 75 + Math.floor(((row.name.length + idx) * 3) % 22);

    // Ticket tiers (VIP = 2.5× base)
    const vipPrice = Math.round(row.price * 2.5);
    const genSeats = 500;
    const vipSeats = 100;

    // ── Rich tags — especially important for search/AI matching ──────────────
    const techTagsMap: Record<string, string[]> = {
      'guwahati ai & innovation hackathon 2026': ['AI', 'Machine Learning', 'Innovation', 'Startup', 'Hackathon', 'IIT Guwahati', 'Guwahati', 'Assam', 'Technology', 'Artificial Intelligence', 'Automation'],
      'assam smart city hackfest 2026':          ['Smart City', 'IoT', 'Development', 'Engineering', 'Hackathon', 'Guwahati', 'Assam', 'Urban Innovation', 'Infrastructure', 'Digital Transformation'],
      'northeast tech summit & developer conference 2026': ['Technology', 'Cloud', 'AI', 'Startups', 'Software Engineering', 'Conference', 'Guwahati', 'Northeast India', 'Assam', 'Developer', 'Keynote', 'Tech Conference'],
    };
    const richTags = techTagsMap[row.name.toLowerCase()] ||
      [category, row.city, row.organizer, row.state, ...row.description.split(' ').filter(w => w.length > 5).slice(0, 3)].filter(Boolean);

    // ── Detect Guwahati tech events for boosted visibility ──────────────────
    const isGuwahatiTechEvent = /guwahati ai|assam smart city|northeast tech summit/i.test(row.name);
    const boostedPopularity = isGuwahatiTechEvent ? 82 + Math.floor((idx * 4) % 15) : popularityScore;
    const boostedTrending   = isGuwahatiTechEvent ? 85 + Math.floor((idx * 3) % 12) : trendingScore;
    const isFeaturedEvent   = isBigName || isGuwahatiTechEvent || idx < 3;

    // ── Date with correct time for each event type ───────────────────────────
    const eventTime = isGuwahatiTechEvent
      ? (row.date === '2026-08-22' ? 'T04:30:00.000Z'  // 10:00 AM IST
        : row.date === '2026-07-18' ? 'T03:30:00.000Z'  // 9:00 AM IST
        : 'T04:00:00.000Z')                              // 9:30 AM IST
      : 'T13:30:00.000Z'; // Default 7PM IST for concerts

    return {
      _id: `csv-evt-${idx + 1}`,
      title: row.name,
      slug,
      description: row.description ||
        `Experience ${row.name} — a premier event hosted at ${row.venue}, ${row.city}. Join us for an unforgettable experience!`,
      category,
      rawCategory: row.category,
      banner,
      date: `${row.date}${eventTime}`,
      venue: {
        name: row.venue,
        city: row.city,
        state: row.state,
        address: `${row.venue}, ${row.city}, ${row.state}`,
      },
      location: coords,
      ticketTiers: [
        {
          _id: `${slug}-ga`,
          name: 'General Admission',
          price: row.price,
          totalSeats: genSeats,
          soldSeats: Math.floor(Math.random() * (genSeats * 0.6)),
        },
        {
          _id: `${slug}-vip`,
          name: 'VIP',
          price: vipPrice,
          totalSeats: vipSeats,
          soldSeats: Math.floor(Math.random() * (vipSeats * 0.75)),
        },
      ],
      organizerId: {
        _id: `org-${idx + 1}`,
        name: row.organizer || row.name,
        email: `contact@${makeSlug(row.organizer || row.name)}.com`,
        referralCode: `REF${(idx + 1).toString().padStart(3, '0')}`,
      },
      featured: isFeaturedEvent,
      popularityScore: boostedPopularity,
      trendingScore: boostedTrending,
      tags: richTags,
      compatibilityScore,
    };
  });
}

// ─── Exported static dataset ───────────────────────────────────────────────────

/** Complete list of all events from the CSV — the app-wide single source of truth. */
export const CSV_EVENTS: EventRecord[] = buildEventsFromRows(RAW_CSV_ROWS);

/** Featured events (popularity-sorted) */
export const FEATURED_EVENTS = [...CSV_EVENTS]
  .filter(e => e.featured)
  .sort((a, b) => b.popularityScore - a.popularityScore);

/** Events grouped by normalised category */
export const EVENTS_BY_CATEGORY: Record<string, EventRecord[]> = CSV_EVENTS.reduce(
  (acc, e) => {
    if (!acc[e.category]) acc[e.category] = [];
    acc[e.category].push(e);
    return acc;
  },
  {} as Record<string, EventRecord[]>,
);

/** Map markers for the heat-map */
export const MAP_MARKERS = CSV_EVENTS.map(e => ({
  id: e._id,
  title: e.title,
  lat: e.location.lat,
  lng: e.location.lng,
  city: e.venue.city,
  category: e.category,
  price: e.ticketTiers[0]?.price ?? 0,
  banner: e.banner,
  slug: e.slug,
}));

// ─── Search helper used by AI components ──────────────────────────────────────

/**
 * Fuzzy search across events. Matches against title, description,
 * category, city, organizer name and tags.
 */
export function searchEvents(query: string, source: EventRecord[] = CSV_EVENTS): EventRecord[] {
  if (!query.trim()) return source;
  const q = query.toLowerCase();
  return source.filter(e => {
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.venue.city.toLowerCase().includes(q) ||
      e.venue.state.toLowerCase().includes(q) ||
      e.organizerId.name.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  });
}

/** Filter events by category (case-insensitive partial match) */
export function filterByCategory(category: string, source: EventRecord[] = CSV_EVENTS): EventRecord[] {
  if (!category || category === 'All') return source;
  const q = category.toLowerCase();
  return source.filter(e => e.category.toLowerCase().includes(q));
}

/** Get a single event by slug */
export function getEventBySlug(slug: string, source: EventRecord[] = CSV_EVENTS): EventRecord | undefined {
  return source.find(e => e.slug === slug);
}

/** Get recommended events similar to a given event */
export function getRelatedEvents(eventId: string, limit = 3, source: EventRecord[] = CSV_EVENTS): EventRecord[] {
  const event = source.find(e => e._id === eventId);
  if (!event) return source.slice(0, limit);
  return source
    .filter(e => e._id !== eventId && e.category === event.category)
    .slice(0, limit);
}

const Event = require('../models/Event');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE_PATH = path.join(__dirname, '../../../EventNova_Events_Dataset_2026 - EventNova Dataset.csv');


const CITY_COORDS = {
  Bangalore:   { lat: 12.9716, lng: 77.5946 },
  Mumbai:      { lat: 19.0760, lng: 72.8777 },
  Chennai:     { lat: 13.0827, lng: 80.2707 },
  Delhi:       { lat: 28.7041, lng: 77.1025 },
  Hyderabad:   { lat: 17.3850, lng: 78.4867 },
  Pune:        { lat: 18.5204, lng: 73.8567 },
  Ahmedabad:   { lat: 23.0225, lng: 72.5714 },
  Kolkata:     { lat: 22.5726, lng: 88.3639 },
  Jaipur:      { lat: 26.9124, lng: 75.7873 },
  Guwahati:    { lat: 26.1445, lng: 91.7362 },
  'Navi Mumbai': { lat: 19.0330, lng: 73.0297 },
  Indore:      { lat: 22.7196, lng: 75.8577 },
  Chandigarh:  { lat: 30.7333, lng: 76.7794 },
  Lucknow:     { lat: 26.8467, lng: 80.9462 },
  Surat:       { lat: 21.1702, lng: 72.8311 },
};

const BANNERS = {
  'Music Concert': 'https://images.unsplash.com/photo-1540039155732-61ee020c66db?auto=format&fit=crop&q=80&w=800',
  'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
  'Business': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
  'Workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
  'Festival': 'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=800',
  'Other': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
  'Default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
};

const EVENT_BANNERS = {
  'arijit singh live 2026':          '/assets/events/arijit-singh-official.jpg',
  'shreya ghoshal melody night':     '/assets/events/shreya-ghoshal-official.jpg',
  'a.r. rahman world tour india':    '/assets/events/ar-rahman-official.jpg',
  'sonu nigam unplugged':            '/assets/events/sonu-nigam-official.jpg',
  'armaan malik live in concert':    '/assets/events/armaan-malik-official.jpg',
  'nilesh rage':                     '/assets/events/nilesh-rage-official.jpg',
  'winter carnival 2026':            '/assets/events/winter-carnival-official.jpg',
  'taylor swift':                    '/assets/events/taylor-swift-official.jpg',
  "guns n' roses":                   '/assets/events/guns-n-roses-official.jpg'
};

function normaliseCategory(raw) {
  const r = (raw || '').trim().toLowerCase();
  if (r.includes('music') || r.includes('concert') || r.includes('melody') || r.includes('live')) return 'Music Concert';
  if (r.includes('hackathon') || r.includes('hack') || r.includes('coding') || r.includes('game') || r.includes('gaming')) return 'Hackathon';
  if (r.includes('festival') || r.includes('carnival') || r.includes('fair') || r.includes('fest')) return 'Festival';
  if (r.includes('workshop') || r.includes('masterclass') || r.includes('training') || r.includes('bootcamp')) return 'Workshop';
  if (r.includes('business') || r.includes('startup') || r.includes('summit') || r.includes('networking') || r.includes('expo') || r.includes('conference')) return 'Business';
  return 'Other';
}

let _csvEventsCache = null;
let _lastCsvMtime = 0;

const getEventsFromCSV = () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      return resolve([]);
    }

    try {
      const stats = fs.statSync(CSV_FILE_PATH);
      if (_csvEventsCache && stats.mtimeMs <= _lastCsvMtime) {
        return resolve(_csvEventsCache);
      }
      _lastCsvMtime = stats.mtimeMs;
    } catch (err) {
      console.error('Error reading CSV stats:', err);
    }

    const events = [];
    let musicConcertCount = 0;

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const keys = Object.keys(row);
        const getVal = (possibleNames) => {
          for (const name of possibleNames) {
            const foundKey = keys.find(k => k.toLowerCase().trim() === name.toLowerCase());
            if (foundKey && row[foundKey] !== undefined) return row[foundKey].trim();
          }
          return '';
        };

        const eventName = getVal(['Event Name', 'EventName', 'title', 'name']);
        if (!eventName) return;

        const rawCategory = getVal(['Category', 'category']);
        const category = normaliseCategory(rawCategory);

        const organizer = getVal(['Artist/Organizer', 'Artist', 'Organizer', 'organizer', 'artist']);
        const city = getVal(['City', 'city']) || 'Guwahati';
        const state = getVal(['State', 'state']) || 'Assam';
        
        const eventDateStr = getVal(['Start Date', 'Startdate', 'date', 'time']);
        let eventDate = new Date();
        const parts = eventDateStr ? eventDateStr.split('-') : [];
        if (parts.length === 3) {
          if (parseInt(parts[1]) > 12) {
            eventDate = new Date(`${parts[0]}-${parts[2]}-${parts[1]}`);
          } else {
            eventDate = new Date(eventDateStr);
          }
        }
        if (isNaN(eventDate.getTime())) eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const endDate = new Date(eventDate.getTime() + 4 * 60 * 60 * 1000);
        
        const priceStr = getVal(['Price (INR)', 'Price', 'price']);
        const price = parseInt(priceStr, 10) || 0;

        const description = getVal(['Description', 'description']) || `Join us for ${eventName} in ${city}.`;

        const bannerVal = getVal(['Banner', 'banner']);
        let bannerUrl = '';
        if (bannerVal && (bannerVal.startsWith('http') || bannerVal.startsWith('/'))) {
          bannerUrl = bannerVal;
        } else {
          // Check EVENT_BANNERS first
          const nameLower = eventName.toLowerCase().trim();
          for (const [key, url] of Object.entries(EVENT_BANNERS)) {
            if (nameLower.includes(key) || key.includes(nameLower.split(' ')[0])) {
              bannerUrl = url;
              break;
            }
          }
          if (!bannerUrl) {
            bannerUrl = BANNERS[category] || BANNERS['Default'];
          }
        }

        const csvLat = getVal(['Latitude', 'lat']);
        const csvLng = getVal(['Longitude', 'lng']);
        let lat = csvLat ? parseFloat(csvLat) : null;
        let lng = csvLng ? parseFloat(csvLng) : null;

        if (isNaN(lat) || lat === null || isNaN(lng) || lng === null) {
          const coords = CITY_COORDS[city] || CITY_COORDS['Guwahati'];
          lat = coords.lat;
          lng = coords.lng;
        }

        const cleanSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        const csvPopularity = getVal(['popularity_score', 'popularityScore', 'popularity']);
        const csvTrending = getVal(['trending_score', 'trendingScore', 'trending']);
        const csvFeatured = getVal(['featured']);

        const popularityScore = csvPopularity ? parseInt(csvPopularity, 10) : (category === 'Music Concert' ? 95 : Math.floor(Math.random() * 25) + 65);
        const trendingScore = csvTrending ? parseInt(csvTrending, 10) : (category === 'Music Concert' ? 90 : Math.floor(Math.random() * 25) + 60);
        
        let featured = false;
        if (csvFeatured) {
          featured = csvFeatured.toLowerCase() === 'true' || csvFeatured === '1' || csvFeatured.toLowerCase() === 'yes';
        } else if (category === 'Music Concert') {
          musicConcertCount++;
          if (musicConcertCount <= 3) {
            featured = true;
          }
        }

        events.push({
          _id: cleanSlug,
          title: eventName,
          slug: cleanSlug,
          description,
          category,
          banner: bannerUrl,
          date: eventDate.toISOString(),
          endDate: endDate.toISOString(),
          venue: {
            name: getVal(['Venue', 'venue']) || 'Main Arena',
            address: `${getVal(['Venue', 'venue']) || 'Arena'}, ${city}, ${state}`,
            city,
            state
          },
          location: { lat, lng },
          ticketTiers: [
            { name: 'General Admission', price: price, totalSeats: 500, soldSeats: 0 },
            { name: 'VIP', price: Math.round(price * 2.5), totalSeats: 100, soldSeats: 0 }
          ],
          tags: [category, city, organizer].filter(Boolean),
          organizerId: { _id: 'admin1', name: organizer || 'System Admin' },
          status: 'published',
          popularityScore,
          trendingScore,
          featured
        });
      })
      .on('end', () => {
        _csvEventsCache = events;
        resolve(events);
      })
      .on('error', () => resolve([]));
  });
};

let _lastSyncTimestamp = 0;
const syncCSVEventsToDB = async () => {
  try {
    if (global.dbOffline) return;
    
    const now = Date.now();
    if (now - _lastSyncTimestamp < 5000) return;
    _lastSyncTimestamp = now;

    if (!fs.existsSync(CSV_FILE_PATH)) return;
    
    const csvEvents = await getEventsFromCSV();
    if (csvEvents.length === 0) return;

    let organizer = await User.findOne({ role: { $in: ['admin', 'organizer'] } });
    if (!organizer) {
      organizer = await User.create({
        name: 'Admin EventNova',
        email: 'admin@eventnova.com',
        password: 'password123',
        role: 'admin',
      });
    }

    for (const item of csvEvents) {
      const existing = await Event.findOne({ slug: item.slug });
      
      const eventData = {
        title: item.title,
        slug: item.slug,
        description: item.description,
        category: item.category,
        banner: item.banner,
        date: new Date(item.date),
        endDate: new Date(item.endDate),
        venue: item.venue,
        location: item.location,
        organizerId: organizer._id,
        featured: item.featured,
        popularityScore: item.popularityScore,
        trendingScore: item.trendingScore,
        tags: item.tags,
        status: 'published'
      };

      if (existing) {
        const updatedTiers = existing.ticketTiers.map((tier, idx) => {
          const matchingCsvTier = item.ticketTiers[idx];
          if (matchingCsvTier) {
            return {
              _id: tier._id,
              name: tier.name,
              price: matchingCsvTier.price,
              totalSeats: tier.totalSeats,
              soldSeats: tier.soldSeats,
            };
          }
          return tier;
        });

        if (updatedTiers.length === 0) {
          eventData.ticketTiers = item.ticketTiers;
        } else {
          eventData.ticketTiers = updatedTiers;
        }

        await Event.findByIdAndUpdate(existing._id, eventData);
      } else {
        eventData.ticketTiers = item.ticketTiers;
        await Event.create(eventData);
      }
    }
    console.log(`✅ Successfully synced ${csvEvents.length} events from CSV to MongoDB.`);
  } catch (error) {
    console.error('❌ Error syncing CSV events to database:', error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, banner, date, endDate, venue, ticketTiers, tags } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      banner,
      date,
      endDate,
      venue,
      ticketTiers,
      tags: tags || [],
      organizerId: req.user.id,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all events (with filter / search)
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  if (!global.dbOffline) {
    await syncCSVEventsToDB();
  }
  const mockEvents = [
    {
      _id: 'featured_1',
      title: 'Let It Go World Tour',
      slug: 'let-it-go-world-tour',
      description: 'First ever concert from this emerging artist. Taking his live concert to your city. Don\'t forget to be part of it.',
      category: 'Music Concert',
      banner: '/images/let_it_go_banner.jpg',
      venueMap: '/images/let_it_go_stadium.jpg',
      date: '2026-08-08T19:00:00.000Z',
      venue: { name: 'Indra Gandhi Stadium', city: 'Guwahati' },
      location: { lat: 26.1433, lng: 91.7898 },
      popularityScore: 95,
      featured: true,
      ticketTiers: [
        { name: 'General', price: 799 },
        { name: 'Gold', price: 1299 },
        { name: 'Premium', price: 1999 },
        { name: 'VIP', price: 2999 }
      ],
      organizerId: { name: 'Fusion Group Games' },
      status: 'published'
    },
    {
      _id: '1',
      title: 'EDM Pulse Night 2026',
      slug: 'edm-pulse-night-2026-xyz',
      description: 'Experience the premium EDM pulse festival featuring the country\'s top artists.',
      category: 'Music',
      banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
      date: '2026-06-15T19:00:00.000Z',
      venue: { name: 'Main Arena', city: 'Mumbai' },
      location: { lat: 19.0760, lng: 72.8777 },
      popularityScore: 98,
      ticketTiers: [{ name: 'General', price: 999 }, { name: 'VIP', price: 2999 }],
      organizerId: { name: 'Pulsar Entertainment' },
      status: 'published'
    },
    {
      _id: '2',
      title: 'NextGen AI & Tech Summit',
      slug: 'nextgen-ai-tech-summit-abc',
      description: 'Discover the future of software development, neural networks, and Web3 in this tech summit.',
      category: 'Tech Conference',
      banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
      date: '2026-07-10T10:00:00.000Z',
      venue: { name: 'Innovation Lab', city: 'Bangalore' },
      location: { lat: 12.9716, lng: 77.5946 },
      popularityScore: 85,
      ticketTiers: [{ name: 'General', price: 499 }],
      organizerId: { name: 'TechLabs' },
      status: 'published'
    },
    {
      _id: '3',
      title: 'HyperDrive Hackathon & Gaming Fest',
      slug: 'hyperdrive-hackathon-gaming-fest-mnp',
      description: 'A 36-hour elite coding and high-performance esports tournament at national level.',
      category: 'Gaming',
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
      date: '2026-06-25T09:00:00.000Z',
      venue: { name: 'Auditorium Hall', city: 'Delhi' },
      location: { lat: 28.6139, lng: 77.2090 },
      popularityScore: 70,
      ticketTiers: [{ name: 'General', price: 199 }],
      organizerId: { name: 'Esports India' },
      status: 'published'
    },
    {
      _id: '4',
      title: 'Design Thinking Bootcamp',
      slug: 'design-thinking-bootcamp',
      description: 'Learn design thinking methodologies in a 2-day intensive workshop.',
      category: 'Workshop',
      banner: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
      date: '2026-08-12T10:00:00.000Z',
      venue: { name: 'Creative Hub', city: 'Pune' },
      location: { lat: 18.5204, lng: 73.8567 },
      popularityScore: 65,
      ticketTiers: [{ name: 'General', price: 1299 }],
      organizerId: { name: 'Design Co' },
      status: 'published'
    },
    {
      _id: '5',
      title: 'Startup Expo 2026',
      slug: 'startup-expo-2026',
      description: 'Meet investors, network with founders, and showcase your startup.',
      category: 'Business',
      banner: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800',
      date: '2026-09-05T09:00:00.000Z',
      venue: { name: 'Expo Center', city: 'Mumbai' },
      location: { lat: 19.0500, lng: 72.9000 },
      popularityScore: 92,
      ticketTiers: [{ name: 'Visitor', price: 0 }, { name: 'Exhibitor', price: 5000 }],
      organizerId: { name: 'StartupIndia' },
      status: 'published'
    },
    {
      _id: '6',
      title: 'Amer Boating - Jaipur',
      slug: 'amer-boating-jaipur',
      description: 'Enjoy a peaceful and scenic boating experience at Maota Lake near the historic Amer Fort. Visitors can choose from multiple boating experiences while enjoying panoramic views of Jaipur\'s heritage landscape.',
      category: 'Tourism',
      banner: 'https://images.unsplash.com/photo-1596422846543-74c6eb28bc3a?auto=format&fit=crop&q=80&w=800',
      date: '2026-10-01T09:00:00.000Z',
      venue: { name: 'Maota Lake', city: 'Jaipur' },
      location: { lat: 26.9855, lng: 75.8513 },
      popularityScore: 75,
      ticketTiers: [{ name: 'General', price: 100 }],
      organizerId: { name: 'Amer Boating' },
      status: 'published'
    }
  ];

  if (global.dbOffline) {
    const { search, category, minPrice, maxPrice, city, sort } = req.query;
    let filtered = await getEventsFromCSV();
    
    // Fallback if no CSV
    if (filtered.length === 0) {
      filtered = [...mockEvents];
    }
    
    if (category && category !== 'All') {
      filtered = filtered.filter(e => e.category === category);
    }
    if (search) {
      filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (minPrice !== undefined) {
      filtered = filtered.filter(e => e.ticketTiers[0].price >= parseInt(minPrice));
    }
    if (maxPrice !== undefined) {
      filtered = filtered.filter(e => e.ticketTiers[0].price <= parseInt(maxPrice));
    }
    if (city) {
      filtered = filtered.filter(e => e.venue.city.toLowerCase().includes(city.toLowerCase()));
    }
    
    // Sort logic
    if (sort) {
      if (sort === 'newest' || sort === 'upcoming') {
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      } else if (sort === 'popularity') {
        filtered.sort((a, b) => b.popularityScore - a.popularityScore);
      } else if (sort === 'price_asc') {
        filtered.sort((a, b) => a.ticketTiers[0].price - b.ticketTiers[0].price);
      } else if (sort === 'price_desc') {
        filtered.sort((a, b) => b.ticketTiers[0].price - a.ticketTiers[0].price);
      }
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      events: filtered,
    });
  }

  try {
    const { category, search, city, organizerId, minPrice, maxPrice, sort } = req.query;
    let query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (organizerId) {
      query.organizerId = organizerId;
    }

    if (city) {
      query['venue.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['ticketTiers.0.price'] = {};
      if (minPrice !== undefined) query['ticketTiers.0.price'].$gte = parseInt(minPrice);
      if (maxPrice !== undefined) query['ticketTiers.0.price'].$lte = parseInt(maxPrice);
    }

    let sortOption = { date: 1 };
    if (sort === 'popularity') sortOption = { popularityScore: -1 };
    else if (sort === 'price_asc') sortOption = { 'ticketTiers.0.price': 1 };
    else if (sort === 'price_desc') sortOption = { 'ticketTiers.0.price': -1 };

    let events = await Event.find(query)
      .populate('organizerId', 'name email avatar')
      .sort(sortOption);

    // If organizer requested events, but has none, return the seeded/imported events as demo events
    if (organizerId && events.length === 0) {
      events = await Event.find({ status: 'published' })
        .populate('organizerId', 'name email avatar')
        .limit(5);
      
      // If DB is empty, get from CSV
      if (events.length === 0) {
        const csvEvents = await getEventsFromCSV();
        events = csvEvents.slice(0, 5);
      }
    }

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    let fallbackEvents = await getEventsFromCSV();
    if (fallbackEvents.length === 0) fallbackEvents = mockEvents;
    res.status(200).json({
      success: true,
      count: fallbackEvents.length,
      events: fallbackEvents,
    });
  }
};

// @desc    Get event by slug
// @route   GET /api/events/slug/:slug
// @access  Public
exports.getEventBySlug = async (req, res) => {
  if (!global.dbOffline) {
    await syncCSVEventsToDB();
  }
  const mockEvent1 = {
    _id: '1',
    title: 'EDM Pulse Night 2026',
    slug: 'edm-pulse-night-2026-xyz',
    description: 'Experience the premium EDM pulse festival featuring the country\'s top artists. Get ready for an absolute sensory overload with state of the art lighting, audio, and visual integrations that will blow your mind. Join a community of music lovers celebrating together live.',
    category: 'Music',
    banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    date: '2026-06-15T19:00:00.000Z',
    endDate: '2026-06-16T02:00:00.000Z',
    venue: { name: 'Main Arena', address: 'Plot 42, Music Plaza, Bandra East', city: 'Mumbai' },
    ticketTiers: [
      { _id: 't1', name: 'General Admission', price: 999, totalSeats: 200, soldSeats: 145 },
      { _id: 't2', name: 'VIP Pass', price: 2999, totalSeats: 50, soldSeats: 22 },
    ],
    organizerId: {
      _id: 'o1',
      name: 'Pulsar Entertainment',
      email: 'info@pulsar.com',
      referralCode: 'pulsar123',
    },
  };

  const mockEventAmer = {
    _id: '6',
    title: 'Amer Boating - Jaipur',
    slug: 'amer-boating-jaipur',
    description: 'Enjoy a peaceful and scenic boating experience at Maota Lake near the historic Amer Fort. Visitors can choose from multiple boating experiences while enjoying panoramic views of Jaipur\'s heritage landscape.\n\nHighlights:\n* Beautiful lake views\n* Amer Fort backdrop\n* Family-friendly experience\n* Tourism attraction\n* Multiple boating options\n* Suitable for couples and tourists',
    category: 'Tourism',
    banner: 'https://images.unsplash.com/photo-1596422846543-74c6eb28bc3a?auto=format&fit=crop&q=80&w=800',
    date: '2026-10-01T09:00:00.000Z',
    endDate: '2026-10-01T18:00:00.000Z',
    venue: { name: 'Maota Lake', address: 'Maota Lake, Devisinghpura, Amer, Rajasthan 302028', city: 'Jaipur' },
    location: { lat: 26.9855, lng: 75.8513 },
    popularityScore: 75,
    ticketTiers: [
      { _id: 't1', name: 'General', price: 100, totalSeats: 1000, soldSeats: 450 },
    ],
    organizerId: {
      _id: 'o2',
      name: 'Amer Boating',
      email: 'info@amerboating.com',
      referralCode: 'amer123',
    },
  };

  const mockEventFeatured = {
    _id: 'featured_1',
    title: 'Let It Go World Tour',
    slug: 'let-it-go-world-tour',
    description: 'First ever concert from this emerging artist. Taking his live concert to your city. Don\'t forget to be part of it.\n\nHighlights:\n* First live city performance\n* High-energy music experience\n* Live stage production\n* Premium seating available\n* VIP fan zone access\n\nVenue Features:\n* VIP Pit\n* Premium Zone\n* Gold Zone\n* General Admission\n* Food Court\n* Merchandise Booth',
    category: 'Music Concert',
    tags: ['Music', 'Concert', 'Live Performance', 'Trending', 'Featured'],
    banner: '/images/let_it_go_banner.jpg',
    venueMap: '/images/let_it_go_stadium.jpg',
    date: '2026-08-08T19:00:00.000Z',
    endDate: '2026-08-08T23:30:00.000Z',
    venue: { name: 'Indra Gandhi Stadium', address: 'Guwahati, Assam', city: 'Guwahati' },
    location: { lat: 26.1433, lng: 91.7898 },
    popularityScore: 95,
    featured: true,
    ticketTiers: [
      { _id: 't1', name: 'General', price: 799, totalSeats: 2000, soldSeats: 1500 },
      { _id: 't2', name: 'Gold', price: 1299, totalSeats: 1000, soldSeats: 800 },
      { _id: 't3', name: 'Premium', price: 1999, totalSeats: 500, soldSeats: 450 },
      { _id: 't4', name: 'VIP', price: 2999, totalSeats: 100, soldSeats: 90 },
    ],
    organizerId: {
      _id: 'o3',
      name: 'Fusion Group Games',
      email: 'contact@fusion.com',
      referralCode: 'fusion123',
    },
  };

  if (global.dbOffline) {
    const csvEvents = await getEventsFromCSV();
    let event = csvEvents.find(e => e.slug === req.params.slug);
    
    if (!event) {
      event = mockEvent1;
      if (req.params.slug === 'amer-boating-jaipur') event = mockEventAmer;
      if (req.params.slug === 'let-it-go-world-tour') event = mockEventFeatured;
    }
    
    return res.status(200).json({
      success: true,
      event: event,
    });
  }

  try {
    const event = await Event.findOne({ slug: req.params.slug })
      .populate('organizerId', 'name email avatar referralCode');

    if (!event) {
      const csvEvents = await getEventsFromCSV();
      let fallbackEvent = csvEvents.find(e => e.slug === req.params.slug);
      
      if (!fallbackEvent) {
        fallbackEvent = mockEvent1;
        if (req.params.slug === 'amer-boating-jaipur') fallbackEvent = mockEventAmer;
        if (req.params.slug === 'let-it-go-world-tour') fallbackEvent = mockEventFeatured;
      }
      
      return res.status(200).json({
        success: true,
        event: fallbackEvent,
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    const csvEvents = await getEventsFromCSV();
    let fallbackEvent = csvEvents.find(e => e.slug === req.params.slug);
    
    if (!fallbackEvent) {
      fallbackEvent = mockEvent1;
      if (req.params.slug === 'amer-boating-jaipur') fallbackEvent = mockEventAmer;
      if (req.params.slug === 'let-it-go-world-tour') fallbackEvent = mockEventFeatured;
    }

    res.status(200).json({
      success: true,
      event: fallbackEvent,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Track click from marketing campaign or referral link
// @route   GET /api/events/track
// @access  Public
exports.trackReferralClick = async (req, res) => {
  try {
    const { ref, eventId, source } = req.query;

    if (!eventId) {
      return res.status(400).send('Missing eventId parameter');
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Determine campaign name and source
    let campaignName = 'Direct Traffic';
    let trackingSource = source || 'direct';

    if (ref) {
      // Find promoter
      const promoter = await User.findOne({ referralCode: ref });
      if (promoter) {
        campaignName = `Affiliate Prom: ${promoter.name}`;
        trackingSource = 'referral';
      }
    } else if (source) {
      campaignName = `Campaign: ${source.toUpperCase()}`;
    }

    // Find or create Campaign tracking entry
    let campaign = await Campaign.findOne({
      eventId,
      source: trackingSource,
      name: campaignName,
    });

    if (!campaign) {
      campaign = await Campaign.create({
        eventId,
        organizerId: event.organizerId,
        name: campaignName,
        source: trackingSource,
        clicks: 1,
      });
    } else {
      campaign.clicks += 1;
      await campaign.save();
    }

    // Redirect to the frontend event details page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let redirectUrl = `${frontendUrl}/events/${event.slug}`;
    if (ref) {
      redirectUrl += `?ref=${ref}`;
    } else if (source) {
      redirectUrl += `?utm_source=${source}`;
    }

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Tracking Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getEventsFromCSV = getEventsFromCSV;

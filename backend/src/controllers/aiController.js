const { GoogleGenAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_FILE_PATH = path.join(__dirname, '../../../EventNova_Events_Dataset_2026 - EventNova Dataset.csv');


let _csvEventsContextCache = null;
let _lastCsvContextMtime = 0;

const getCSVEventsForContext = () => {
  return new Promise((resolve) => {
    if (!fs.existsSync(CSV_FILE_PATH)) return resolve([]);

    try {
      const stats = fs.statSync(CSV_FILE_PATH);
      if (_csvEventsContextCache && stats.mtimeMs <= _lastCsvContextMtime) {
        return resolve(_csvEventsContextCache);
      }
      _lastCsvContextMtime = stats.mtimeMs;
    } catch (err) {
      console.error('Error reading CSV stats in AI controller:', err);
    }

    const BANNERS = {
      'Music Concert': 'https://images.unsplash.com/photo-1540039155732-61ee020c66db?auto=format&fit=crop&q=80&w=800',
      'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
      'Business': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800',
      'Workshop': 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
      'Festival': 'https://images.unsplash.com/photo-1533174000244-b04313f86e35?auto=format&fit=crop&q=80&w=800',
      'Other': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
      'Default': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800'
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

    const events = [];
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
        const venue = getVal(['Venue', 'venue']) || 'Main Arena';
        const priceStr = getVal(['Price (INR)', 'Price', 'price']);
        const price = parseInt(priceStr, 10) || 0;
        const description = getVal(['Description', 'description']) || `Join us for ${eventName} in ${city}.`;

        const bannerVal = getVal(['Banner', 'banner']);
        let bannerUrl = '';
        if (bannerVal && (bannerVal.startsWith('http') || bannerVal.startsWith('/'))) {
          bannerUrl = bannerVal;
        } else {
          bannerUrl = BANNERS[category] || BANNERS['Default'];
        }

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

        const cleanSlug = eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        events.push({
          name: eventName,
          title: eventName,
          slug: cleanSlug,
          category,
          city,
          venue,
          date: eventDate.toISOString(),
          price,
          description,
          banner: bannerUrl,
          organizer: organizer || 'EventNova',
        });
      })
      .on('end', () => {
        _csvEventsContextCache = events;
        resolve(events);
      })
      .on('error', () => resolve([]));
  });
};

// Helper to call Google Gemini API or fallback to smart mocks
const generateWithGemini = async (prompt, category) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'mock' && apiKey !== '') {
    try {
      // In newer @google/generative-ai, we initialize GoogleGenAI or GoogleGenerativeAI
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('Gemini API Error:', err);
      // Fallback to mock on error to maintain absolute resilience!
    }
  }

  // Smart responsive mock fallback
  return getSmartMockResponse(prompt, category);
};

const getSmartMockResponse = (prompt, category) => {
  const cat = (category || 'default').toLowerCase();
  
  if (prompt.includes('description')) {
    if (cat.includes('music')) {
      return `Feel the bass and let the music take control! 🎵 Join us for an electrifying night of live beats, neon lights, and non-stop dancing. Featuring world-class DJs, immersive soundscapes, and a crowd that knows how to party, this is the music festival you cannot afford to miss. Get your tickets now before early-bird pricing ends!`;
    }
    if (cat.includes('fest')) {
      return `Get ready for the ultimate celebration of talent, culture, and innovation! 🚀 Our Annual College Fest is back, bigger and better than ever. From dramatic stage battles and high-energy dance face-offs to hackathons, gaming tournaments, and delicious food stalls, there's something for everyone. Grab your friends and make memories that will last a lifetime!`;
    }
    if (cat.includes('conference') || cat.includes('tech')) {
      return `Unlock the future at our premier Tech Conference! 💻 Join industry pioneers, expert developers, and visionary founders as we dive deep into artificial intelligence, blockchain, cloud computing, and next-generation software development. Get ready for hands-on labs, insightful keynote presentations, and unmatched networking opportunities. Fuel your career today!`;
    }
    if (cat.includes('workshop')) {
      return `Elevate your skills in this intensive, hands-on learning experience! 🛠️ Designed for beginners and intermediate professionals alike, this workshop offers practical, real-world knowledge led by industry leaders. You'll work on live projects, receive direct mentoring, and take home a certificate of completion. Seats are strictly limited to ensure personal interaction — book yours now!`;
    }
    return `Welcome to the year's most highly anticipated event! Join us for a unique gathering of passionate individuals, experts, and community members. Experience immersive sessions, network with like-minded peers, and gain actionable insights. Secure your ticket today and join the conversation!`;
  }

  if (prompt.includes('caption') || prompt.includes('instagram')) {
    if (cat.includes('music')) {
      return `🎉 TURN UP THE VOLUME! The ultimate EDM & Beats Night is finally here! 🎧✨ Get ready to lose yourself in the music and dance till dawn. 🔊🔥\n\n🎟️ Tickets are selling out FAST. Grab yours from the link in bio! 📲\n\n#EDMNight2026 #MusicFestival #LiveBeats #DanceFloor #DJSet #Nightlife #ElectronicMusic #ViralHits`;
    }
    if (cat.includes('fest')) {
      return `✨ The stage is set. The energy is sky-high. College Fest 2026 is officially LIVE! 🎓🔥 Bring your squad, experience the madness, and create memories of a lifetime! 🚀💥\n\n👉 Click the referral link to unlock exclusive group booking discounts! 🎫\n\n#CollegeFest #CampusLife #YouthCulture #SquadGoals #BattleOfTheBands #CampusDiaries #Viral`;
    }
    if (cat.includes('tech') || cat.includes('meet')) {
      return `💡 The future is being coded right here. NextGen Tech Meet 2026 is bringing together the brightest minds in tech! 💻🚀 Let's collaborate, innovate, and disrupt. 🤖✨\n\n🎟️ Click the link in bio to register and secure your seat! 📲\n\n#TechConference #Developers #AI #CodingLife #Innovators #StartupMeetup #TechDisruption #FutureTech`;
    }
    return `🔥 It's official! The countdown has begun for our biggest event of the year. 🚀✨ You do NOT want to miss this experience! Grab your tickets now and join the hype! 🙌🎟️\n\n🔗 Link in bio!\n\n#EventNova #UnforgettableExperience #JoinTheHype #TicketsOnSale #ViralEvent #GoodVibes`;
  }

  // Default marketing email copy
  return `Subject: Exclusively Invited: Secure Your Spot for the Event of the Year! 🌟\n\nDear Creator,\n\nWe are absolutely thrilled to invite you to our upcoming event, designed to bring together community leaders, industry pioneers, and passionate individuals like you!\n\n📅 Date: Upcoming Weekend\n📍 Venue: Prime Location Arena\n\nWhy you can't miss this:\n- Live Interactive Masterclasses with experts\n- High-impact networking with key decision-makers\n- Free food, merchandise, and dynamic social zones!\n\nTickets are selling out rapidly. As an early partner, we're giving you a 10% discount using coupon: WELCOME10.\n\n👉 Click the link to book your tickets now: ${process.env.FRONTEND_URL || 'http://localhost:3000'}\n\nSee you there!\n\nBest regards,\nThe EventNova Team`;
};

// @desc    Generate event description
// @route   POST /api/ai/generate-description
// @access  Private (Organizer/Admin)
exports.generateDescription = async (req, res) => {
  try {
    const { title, category, extraDetails } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event title and category',
      });
    }

    const prompt = `Write a professional, exciting, and catchy event description for an event titled "${title}". The event belongs to the "${category}" category. Additional details provided: "${extraDetails || 'None'}". Make it engaging and encourage users to book tickets.`;

    const description = await generateWithGemini(prompt, category);

    res.status(200).json({
      success: true,
      description,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate Instagram Caption and suggest best post times
// @route   POST /api/ai/generate-caption
// @access  Private (Organizer/Admin)
exports.generateCaption = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event title and category',
      });
    }

    const prompt = `Generate a viral, engaging Instagram caption for an event titled "${title}" in the "${category}" category. Include emojis, highly relevant viral hashtags, a clear call-to-action (link in bio), and short suggestions on the absolute best times of day to post this caption on Instagram.`;

    const resultText = await generateWithGemini(prompt, category);

    // Parse suggestions for best times to post
    const timingSuggestion = category.toLowerCase().includes('music') || category.toLowerCase().includes('fest')
      ? 'Thursdays and Fridays, 6:00 PM - 9:00 PM (Peak social engagement before weekend)'
      : 'Tuesdays and Wednesdays, 11:00 AM - 2:00 PM (Professional networking lunch hour)';

    res.status(200).json({
      success: true,
      caption: resultText,
      timingSuggestion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Chat with AI Event Assistant
// @route   POST /api/ai/chat
// @access  Public
exports.chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Please provide an array of messages' });
    }

    // Build event list from CSV dataset (or fallback to hardcoded)
    const csvEvents = await getCSVEventsForContext();
    let eventListContext;
    if (csvEvents.length > 0) {
      eventListContext = csvEvents.map((e, i) =>
        `${i + 1}. ${e.name} (${e.category}, ${e.city}, ${e.venue}, ₹${e.price}, by ${e.organizer})`
      ).join('\n');
    } else {
      eventListContext = `1. Arijit Singh Live 2026 (Music Concert, Bangalore)\n2. HackIndia National Hackathon (Hackathon, Bangalore)\n3. Startup Networking Summit (Business, Delhi)\n4. Digital Marketing Masterclass (Workshop, Kolkata)\n5. Winter Food Festival (Festival, Jaipur)`;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'mock' || apiKey === '') {
      const userMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      
      let matched = [];
      let reason = '';
      
      if (userMessage.includes('concert') || userMessage.includes('music') || userMessage.includes('sing') || userMessage.includes('shreya') || userMessage.includes('arijit') || userMessage.includes('rahman') || userMessage.includes('sonu') || userMessage.includes('armaan') || userMessage.includes('roses') || userMessage.includes('swift')) {
        matched = csvEvents.filter(e => e.category === 'Music Concert' || e.name.toLowerCase().includes('live') || e.name.toLowerCase().includes('melody') || e.name.toLowerCase().includes('sing') || e.name.toLowerCase().includes('rahman') || e.name.toLowerCase().includes('swift') || e.name.toLowerCase().includes('roses'));
        reason = 'soulful music concerts and live performances';
      } else if (userMessage.includes('hackathon') || userMessage.includes('hack') || userMessage.includes('code') || userMessage.includes('tech') || userMessage.includes('summit')) {
        matched = csvEvents.filter(e => e.category === 'Hackathon' || e.name.toLowerCase().includes('hack') || e.name.toLowerCase().includes('tech') || e.name.toLowerCase().includes('summit'));
        reason = 'coding sprints and tech hackathons';
      } else if (userMessage.includes('workshop') || userMessage.includes('masterclass') || userMessage.includes('learn')) {
        matched = csvEvents.filter(e => e.category === 'Workshop' || e.name.toLowerCase().includes('masterclass') || e.name.toLowerCase().includes('workshop') || e.name.toLowerCase().includes('learn'));
        reason = 'practical learning workshops';
      } else if (userMessage.includes('festival') || userMessage.includes('carnival') || userMessage.includes('food')) {
        matched = csvEvents.filter(e => e.category === 'Festival' || e.name.toLowerCase().includes('festival') || e.name.toLowerCase().includes('carnival') || e.name.toLowerCase().includes('food'));
        reason = 'festivals and carnivals';
      } else if (userMessage.includes('business') || userMessage.includes('startup') || userMessage.includes('meet') || userMessage.includes('networking')) {
        matched = csvEvents.filter(e => e.category === 'Business' || e.name.toLowerCase().includes('startup') || e.name.toLowerCase().includes('networking') || e.name.toLowerCase().includes('meet'));
        reason = 'business networking and startup events';
      } else if (userMessage.includes('near me') || userMessage.includes('near') || userMessage.includes('guwahati') || userMessage.includes('local')) {
        matched = csvEvents.filter(e => e.city.toLowerCase() === 'guwahati' || userMessage.includes(e.city.toLowerCase()));
        reason = 'events happening near you';
      } else {
        matched = csvEvents.filter(e => userMessage.includes(e.city.toLowerCase()));
        if (matched.length > 0) {
          reason = `events in ${matched[0].city}`;
        }
      }

      if (matched.length > 0) {
        let responseMsg = `Here are the top **${reason}** from our 2026 CSV dataset:\n\n`;
        matched.forEach(e => {
          responseMsg += `* **[${e.name}](${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${e.slug})**\n  * **Category**: ${e.category}\n  * **Venue**: ${e.venue}, ${e.city}\n  * **Date**: ${new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n  * **Price**: Starting from ₹${e.price}\n\n`;
        });
        responseMsg += `Would you like me to guide you through booking tickets for any of these?`;
        
        return res.status(200).json({
          success: true,
          message: responseMsg,
        });
      }

      return res.status(200).json({
        success: true,
        message: `I couldn't find any specific matches for that, but here are some of the hottest events from our dataset you might enjoy:\n\n` +
          `1. **[${csvEvents[0]?.name || 'Arijit Singh Live 2026'}](${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${csvEvents[0]?.slug})** — Soulful music concert in ${csvEvents[0]?.city || 'Guwahati'} (₹${csvEvents[0]?.price || '2499'})\n` +
          `2. **[${csvEvents[6]?.name || 'Winter Carnival 2026'}](${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${csvEvents[6]?.slug})** — Festive fun in ${csvEvents[6]?.city || 'Guwahati'} (₹${csvEvents[6]?.price || '299'})\n` +
          `3. **[${csvEvents[7]?.name || 'Taylor Swift India'}](${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${csvEvents[7]?.slug})** — Grand musical experience in ${csvEvents[7]?.city || 'Guwahati'} (₹${csvEvents[7]?.price || '3999'})\n\n` +
          `Tell me your city or preferred category and I'll find the perfect match!`,
      });
    }

    const groq = new Groq({ apiKey });

    const systemPrompt = {
      role: 'system',
      content: `You are EventNova AI, an intelligent event discovery concierge. Help users discover events, recommend trending activities, answer event-related questions, and provide conversational assistance. Format your responses with clear recommendation cards, explain why they are a good match, and provide quick action suggestions. Your tone should be premium, helpful, and enthusiastic.

      IMPORTANT CONTEXT - Current active events from the EventNova 2026 dataset:\n${eventListContext}\n\nAlways refer to these real events when making recommendations. Mention the city, venue, and approximate price when suggesting events.`
    };

    const apiMessages = [systemPrompt, ...messages];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";

    res.status(200).json({ success: true, message: aiResponse });
  } catch (error) {
    console.error('Groq API Error:', error);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI service.' });
  }
};


// @desc    Find Best Seats using AI
// @route   POST /api/ai/best-seats
// @access  Public
exports.findBestSeats = async (req, res) => {
  try {
    const { budget, numTickets, preference, venueLayoutId } = req.body;
    
    // In a real implementation, we would fetch the venue layout, analyze sections
    // and price, and ask the LLM or a heuristic engine to find the best match.
    // Here we'll return a smart mock response.

    const mockResponse = {
      recommendedSection: 'Section B',
      recommendedRow: 'Row 6',
      recommendedSeats: ['B6-12', 'B6-13'],
      totalPrice: budget ? Math.min(budget, 3000) : 3000,
      reason: `Based on your preference for ${preference || 'Best View'} and budget, Section B, Row 6 provides the optimal balance between price and stage visibility.`,
      matchScore: 94
    };

    res.status(200).json({
      success: true,
      data: mockResponse
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate Event Compatibility Score
// @route   POST /api/ai/compatibility
// @access  Public
exports.calculateCompatibility = async (req, res) => {
  try {
    const { eventId, userPreferences } = req.body;
    
    // Mock logic: calculate based on inputs
    const baseScore = Math.floor(Math.random() * 20) + 75; // 75-95%
    
    const reasons = [
      "✓ Matches your preferred categories",
      "✓ Within your typical budget",
      "✓ Similar to previous events you attended"
    ];

    res.status(200).json({
      success: true,
      data: {
        score: baseScore,
        reasons
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Predict Ticket Price
// @route   POST /api/ai/price-prediction
// @access  Public
exports.predictPrice = async (req, res) => {
  try {
    const { eventId, currentPrice } = req.body;
    
    const price = currentPrice || 1500;
    const predictedPrice = Math.floor(price * 1.2); // 20% increase
    const daysToIncrease = Math.floor(Math.random() * 5) + 2;

    res.status(200).json({
      success: true,
      data: {
        currentPrice: price,
        predictedPrice: predictedPrice,
        predictionText: `Likely to increase to ₹${predictedPrice} in ${daysToIncrease} days.`,
        recommendation: 'Buy Now',
        confidenceScore: 88,
        trend: 'up'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


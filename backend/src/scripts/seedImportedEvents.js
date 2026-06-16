const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventnova';

// Hardcoded coordinates
const cities = {
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
};

const banners = {
  Music: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800',
  Hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800',
  Business: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
  Expo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
  Festival: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800',
};

const seedData = [
  ['Arijit Singh Live 2026', 'Music', 'Arijit Singh', 'Bangalore', '2026-07-18', 'Bangalore Arena', 2499, 'Live concert by Arijit Singh'],
  ['Shreya Ghoshal Melody Night', 'Music', 'Shreya Ghoshal', 'Mumbai', '2026-08-08', 'NSCI Dome', 1999, 'Melodious live performance'],
  ['A.R. Rahman World Tour India', 'Music', 'A.R. Rahman', 'Chennai', '2026-09-12', 'Jawaharlal Nehru Stadium', 2999, 'Grand musical experience'],
  ['Sonu Nigam Unplugged', 'Music', 'Sonu Nigam', 'Delhi', '2026-10-03', 'Indira Gandhi Arena', 1799, 'Unplugged concert night'],
  ['Armaan Malik Live in Concert', 'Music', 'Armaan Malik', 'Hyderabad', '2026-11-21', 'Hitex Arena', 1599, 'Youth-focused live concert'],
  ['HackIndia National Hackathon', 'Hackathon', 'HackIndia', 'Bangalore', '2026-07-25', 'Tech Convention Center', 499, '48-hour coding challenge'],
  ['AI Innovation HackFest', 'Hackathon', 'AI Community India', 'Pune', '2026-08-15', 'Pune Tech Park', 399, 'AI and ML focused hackathon'],
  ['Smart City Hackathon', 'Hackathon', 'GovTech Initiative', 'Ahmedabad', '2026-09-05', 'Convention Hall', 299, 'Smart city solutions challenge'],
  ['FinTech Builders Hackathon', 'Hackathon', 'FinTech India', 'Mumbai', '2026-10-17', 'BKC Convention Centre', 599, 'FinTech innovation event'],
  ['CyberSec Capture The Flag', 'Hackathon', 'Cyber India', 'Delhi', '2026-12-05', 'Pragati Maidan', 499, 'Cybersecurity competition'],
  ['Startup Networking Summit', 'Business', 'Startup India', 'Delhi', '2026-08-22', 'Pragati Maidan', 999, 'Networking and startup showcase'],
  ['India Gaming Expo', 'Expo', 'Gaming Association', 'Mumbai', '2026-09-26', 'Bombay Exhibition Centre', 799, 'Gaming and esports expo'],
  ['Digital Marketing Masterclass', 'Workshop', 'Marketing Guild', 'Kolkata', '2026-10-10', 'ITC Sonar Convention Hall', 699, 'Marketing workshop'],
  ['Winter Food Festival', 'Festival', 'Food Lovers Club', 'Jaipur', '2026-12-12', 'Central Ground Jaipur', 299, 'Food and cultural festival'],
  ['Taylor swift', 'Music', 'taylor swift', 'Guwahati', '2026-11-05', 'Barshapara Stadium', 3999, 'Grand musical experience'],
  ['Guns N\' Roses', 'Music', 'band', 'Guwahati', '2026-11-17', 'khanapara Ground', 4999, 'Metal, Rock']
];

const seedImportedEvents = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    let organizer = await User.findOne({ role: { $in: ['admin', 'organizer'] } });
    if (!organizer) {
      organizer = await User.create({ name: 'Admin EventNova', email: 'admin@eventnova.com', password: 'password123', role: 'admin' });
    }

    // Process and insert each event
    for (const data of seedData) {
      const [title, category, orgName, city, dateStr, venue, price, description] = data;
      
      const existing = await Event.findOne({ title });
      if (existing) {
        await Event.deleteOne({ _id: existing._id });
      }

      const date = new Date(`${dateStr}T19:00:00.000Z`);
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + 4);

      // Create event matching the Event model
      await Event.create({
        title,
        description,
        category: category === 'Music' ? 'Music Concert' : category, // Need to make sure category enum matches or map it
        banner: title.includes('Arijit') ? 'https://i.pinimg.com/736x/8f/58/a5/8f58a5c36af8c0825ebbf7f3a8b23ff0.jpg' : (banners[category] || banners.Business),
        date,
        endDate,
        venue: {
          name: venue,
          address: `${venue}, ${city}`,
          city: city,
        },
        location: cities[city] || { lat: 20.5937, lng: 78.9629 }, // Ensure Event model has location if used, else it's fine. Wait, Event model doesn't have location yet!
        organizerId: organizer._id,
        featured: category === 'Music',
        popularityScore: Math.floor(Math.random() * 30) + 70,
        tags: [category, city, '2026'],
        ticketTiers: [
          { name: 'Standard', price: price, totalSeats: 500, soldSeats: Math.floor(Math.random() * 200) },
          { name: 'VIP', price: Math.floor(price * 2.5), totalSeats: 100, soldSeats: Math.floor(Math.random() * 40) }
        ],
        status: 'published'
      });
      console.log(`Seeded: ${title}`);
    }

    console.log('Successfully seeded all imported events!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedImportedEvents();

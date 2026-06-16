const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const User = require('../models/User'); // If organizer is needed

dotenv.config({ path: '../../.env' }); // Depends on where the script is run from. Better to resolve it.
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventnova';

const seedFeaturedEvent = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin or organizer to attach this event to
    let organizer = await User.findOne({ role: { $in: ['admin', 'organizer'] } });
    if (!organizer) {
      console.log('Creating a dummy admin user as organizer...');
      organizer = await User.create({
        name: 'Admin EventNova',
        email: 'admin@eventnova.com',
        password: 'password123',
        role: 'admin',
      });
    }

    // Check if Kygo World Tour already exists
    const existing = await Event.findOne({ title: 'Kygo World Tour' });
    if (existing) {
      console.log('Featured event already exists! Removing old one to recreate.');
      await Event.deleteOne({ _id: existing._id });
    }

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = new Date(nextMonth);
    endDate.setHours(endDate.getHours() + 4);

    const featuredEvent = await Event.create({
      title: 'Kygo World Tour',
      description: 'First ever concert from this emerging artist. Taking his live concert to your city. Don\'t forget to be part of it. \n\nHighlights: \n- First live city performance\n- High-energy music experience\n- Live stage production\n- Premium seating available\n- VIP fan zone access',
      category: 'Music',
      banner: '/images/events/kygo-banner.jpg',
      date: nextMonth,
      endDate: endDate,
      venue: {
        name: 'DY Patil Stadium',
        address: 'Sector 7, Nerul',
        city: 'Navi Mumbai',
      },
      organizerId: organizer._id,
      featured: true,
      popularityScore: 95,
      tags: ['Music', 'Concert', 'Live Performance', 'World Tour', 'VIP'],
      ticketTiers: [
        { name: 'Standard', price: 999, totalSeats: 500 },
        { name: 'Silver', price: 1999, totalSeats: 300 },
        { name: 'Gold', price: 2999, totalSeats: 150 },
        { name: 'Premium', price: 4999, totalSeats: 100 },
        { name: 'VIP Pit', price: 9999, totalSeats: 50 },
      ],
      status: 'published'
    });

    console.log('Successfully seeded featured event:', featuredEvent.title);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding event:', error);
    process.exit(1);
  }
};

seedFeaturedEvent();

const mongoose = require('mongoose');

const TicketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  soldSeats: {
    type: Number,
    default: 0,
    min: 0,
  },
  earlyBirdPrice: {
    type: Number,
    default: null,
  },
  earlyBirdDeadline: {
    type: Date,
    default: null,
  },
});

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Music', 'College Fest', 'Workshop', 'Startup Meet', 'Gaming', 'Tech Conference', 'Music Concert', 'Hackathon', 'Business', 'Festival', 'Expo', 'Other'],
    required: true,
  },
  banner: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ticketTiers: [TicketTierSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published',
  },
  tags: [String],
  featured: {
    type: Boolean,
    default: false,
  },
  popularityScore: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate unique slug pre-validate
EventSchema.pre('validate', function () {
  if (this.title && !this.slug) {
    let cleanSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomChars = Math.random().toString(36).substring(2, 6);
    this.slug = `${cleanSlug}-${randomChars}`;
  }
});

module.exports = mongoose.model('Event', EventSchema);

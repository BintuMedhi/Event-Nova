const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    enum: ['instagram', 'whatsapp', 'facebook', 'twitter', 'email', 'referral', 'linkedin', 'direct'],
    default: 'direct',
  },
  clicks: {
    type: Number,
    default: 0,
    min: 0,
  },
  conversions: {
    type: Number,
    default: 0,
    min: 0,
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'ended'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Campaign', CampaignSchema);

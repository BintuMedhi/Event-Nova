const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  section: { type: String, required: true },
  row: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  status: { type: String, enum: ['available', 'locked', 'booked'], default: 'available' },
  lockedBy: { type: String, default: null }, // socketId or userId
  lockedUntil: { type: Date, default: null },
  type: { type: String, enum: ['standard', 'vip', 'accessible'], default: 'standard' },
  price: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

// Index to quickly find seats for an event
seatSchema.index({ eventId: 1, section: 1, row: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.models.Seat || mongoose.model('Seat', seatSchema);

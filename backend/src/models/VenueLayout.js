const mongoose = require('mongoose');

const venueLayoutSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  sections: [
    {
      id: String,
      name: String,
      price: Number,
      color: String,
      rows: Number,
      seatsPerRow: Number,
      startX: Number,
      startY: Number
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.VenueLayout || mongoose.model('VenueLayout', venueLayoutSchema);

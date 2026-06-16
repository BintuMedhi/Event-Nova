const Seat = require('../models/Seat');

/* ── Realistic Stadium Arena Layout ──────────────────────────── */
const ARENA_CONFIG = {
  cx: 500, // Stage center X
  cy: 100, // Stage center Y
};

const LAYOUT = [
  {
    id: 'VIP_PIT',
    label: 'VIP Pit',
    price: 3500,
    type: 'vip',
    rows: 5,
    baseSeats: 20, // seats in first row
    seatIncrement: 2, // how many extra seats per row
    startRadius: 120,
    rowSpacing: 25,
    startAngle: 60, // degrees
    endAngle: 120,
  },
  {
    id: 'LOWER_BOWL',
    label: 'Lower Bowl Premium',
    price: 2000,
    type: 'premium',
    rows: 8,
    baseSeats: 40,
    seatIncrement: 3,
    startRadius: 280,
    rowSpacing: 30,
    startAngle: 40,
    endAngle: 140,
  },
  {
    id: 'BALCONY',
    label: 'Balcony Standard',
    price: 900,
    type: 'standard',
    rows: 10,
    baseSeats: 55,
    seatIncrement: 4,
    startRadius: 550,
    rowSpacing: 35,
    startAngle: 25,
    endAngle: 155,
  }
];

/**
 * Build an array of mock seats mapped to an SVG arena layout.
 * Seats follow a curved arc mathematically around the stage.
 */
function buildMockSeats(eventId) {
  const mockSeats = [];
  const { cx, cy } = ARENA_CONFIG;

  LAYOUT.forEach((sec) => {
    for (let r = 0; r < sec.rows; r++) {
      const radius = sec.startRadius + r * sec.rowSpacing;
      const numSeats = sec.baseSeats + r * sec.seatIncrement;
      
      const angleRange = sec.endAngle - sec.startAngle;
      const angleStep = angleRange / (numSeats - 1);
      
      const rowLetter = String.fromCharCode(65 + r); // A, B, C...

      for (let s = 0; s < numSeats; s++) {
        const angleDeg = sec.startAngle + s * angleStep;
        const angleRad = (angleDeg * Math.PI) / 180;
        
        const x = cx + radius * Math.cos(angleRad);
        const y = cy + radius * Math.sin(angleRad);
        
        // Quality Score: 100 is best. Closer to stage = better. Closer to center (90 deg) = better.
        const centerDeviation = Math.abs(angleDeg - 90) / 90; // 0 is dead center
        const distanceScore = Math.max(0, 100 - (radius / 10));
        const viewQualityScore = Math.floor(distanceScore * 0.7 + (1 - centerDeviation) * 30);
        
        // accessible seats sprinkled randomly in front rows
        let type = sec.type;
        if (r === 0 && Math.random() > 0.9) type = 'accessible';

        mockSeats.push({
          _id: `seat_${sec.id}_${rowLetter}_${s + 1}`,
          eventId,
          section: sec.id,
          sectionLabel: sec.label,
          row: rowLetter,
          seatNumber: s + 1,
          price: sec.price,
          type,
          x: Math.round(x * 10) / 10,
          y: Math.round(y * 10) / 10,
          distanceFromStage: Math.round(radius),
          viewQualityScore,
          status: Math.random() > 0.85 ? 'booked' : 'available',
          lockedBy: null,
        });
      }
    }
  });
  return mockSeats;
}

// @desc    Get all seats for an event
// @route   GET /api/seats/:eventId
exports.getSeats = async (req, res) => {
  if (global.dbOffline) {
    return res.status(200).json({ success: true, seats: buildMockSeats(req.params.eventId) });
  }

  try {
    const seats = await Seat.find({ eventId: req.params.eventId });

    // Auto-unlock seats where lockedUntil is expired
    const now = new Date();
    const formattedSeats = seats.map(seat => {
      if (seat.status === 'locked' && seat.lockedUntil && seat.lockedUntil < now) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockedUntil = null;
        seat.save().catch(e => console.error(e));
      }
      return seat;
    });

    res.status(200).json({ success: true, seats: formattedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lock a seat temporarily
// @route   POST /api/seats/:eventId/lock
exports.lockSeat = async (req, res) => {
  const { seatId, socketId } = req.body;

  if (global.dbOffline) {
    if (req.io) {
      req.io.to(req.params.eventId).emit('seatStatusChanged', {
        seatId: seatId,
        status: 'locked',
        lockedBy: socketId
      });
    }
    return res.status(200).json({ success: true, seat: { _id: seatId, status: 'locked', lockedBy: socketId } });
  }

  try {
    const seat = await Seat.findById(seatId);
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });

    const now = new Date();
    if ((seat.status === 'locked' && seat.lockedUntil > now) || seat.status === 'booked') {
      return res.status(400).json({ success: false, message: 'Seat is not available' });
    }

    seat.status = 'locked';
    seat.lockedBy = socketId;
    seat.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes hold
    await seat.save();

    // Broadcast update
    if (req.io) {
      req.io.to(req.params.eventId).emit('seatStatusChanged', {
        seatId: seat._id,
        status: 'locked',
        lockedBy: socketId
      });
    }

    res.status(200).json({ success: true, seat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Unlock a seat
// @route   POST /api/seats/:eventId/unlock
exports.unlockSeat = async (req, res) => {
  const { seatId, socketId } = req.body;

  if (global.dbOffline) {
    if (req.io) {
      req.io.to(req.params.eventId).emit('seatStatusChanged', {
        seatId: seatId,
        status: 'available',
        lockedBy: null
      });
    }
    return res.status(200).json({ success: true, seat: { _id: seatId, status: 'available' } });
  }

  try {
    const seat = await Seat.findById(seatId);
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });

    if (seat.lockedBy === socketId) {
      seat.status = 'available';
      seat.lockedBy = null;
      seat.lockedUntil = null;
      await seat.save();

      if (req.io) {
        req.io.to(req.params.eventId).emit('seatStatusChanged', {
          seatId: seat._id,
          status: 'available',
          lockedBy: null
        });
      }
    }

    res.status(200).json({ success: true, seat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Seed mock seats for demo
// @route   POST /api/seats/:eventId/seed
exports.seedSeats = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    await Seat.deleteMany({ eventId });

    const seatsToInsert = buildMockSeats(eventId).map(s => {
      // Remove the custom _id so Mongo generates ObjectIds
      const { _id, ...rest } = s;
      return rest;
    });

    await Seat.insertMany(seatsToInsert);
    res.status(201).json({ success: true, count: seatsToInsert.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

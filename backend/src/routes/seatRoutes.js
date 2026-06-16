const express = require('express');
const router = express.Router();
const { getSeats, lockSeat, unlockSeat, seedSeats } = require('../controllers/seatController');

router.get('/:eventId', getSeats);
router.post('/:eventId/lock', lockSeat);
router.post('/:eventId/unlock', unlockSeat);
router.post('/:eventId/seed', seedSeats); // For demo generation

module.exports = router;

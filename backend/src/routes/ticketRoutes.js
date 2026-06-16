const express = require('express');
const router = express.Router();
const {
  initiateBooking,
  verifyPayment,
  getMyTickets,
  checkInTicket,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.post('/initiate', protect, initiateBooking);
router.post('/verify', protect, verifyPayment);
router.get('/my', protect, getMyTickets);
router.post('/checkin', protect, authorize('organizer', 'admin'), checkInTicket);

module.exports = router;

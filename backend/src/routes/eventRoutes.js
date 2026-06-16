const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  trackReferralClick,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/track', trackReferralClick);
router.get('/slug/:slug', getEventBySlug);

router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getCampaignsByEvent,
  getOrganizerStats,
  getAffiliateStats,
  getAffiliateLeaderboard,
} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');

router.get('/organizer/stats', protect, authorize('organizer', 'admin'), getOrganizerStats);
router.get('/affiliate/stats', protect, getAffiliateStats);
router.get('/affiliate/leaderboard', getAffiliateLeaderboard);

router.post('/', protect, authorize('organizer', 'admin'), createCampaign);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getCampaignsByEvent);

module.exports = router;

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { 
  generateDescription, 
  generateCaption, 
  chatWithAI,
  findBestSeats,
  calculateCompatibility,
  predictPrice
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// Rate limiting for the AI chat endpoint to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many requests to AI chat, please try again later.' }
});

router.post('/generate-description', protect, authorize('organizer', 'admin'), generateDescription);
router.post('/generate-caption', protect, authorize('organizer', 'admin'), generateCaption);

// Public route for event discovery chat
router.post('/chat', chatLimiter, chatWithAI);

// New AI Feature Routes
router.post('/best-seats', findBestSeats);
router.post('/compatibility', calculateCompatibility);
router.post('/price-prediction', predictPrice);

module.exports = router;

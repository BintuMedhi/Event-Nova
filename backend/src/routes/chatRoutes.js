const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { chatWithAI } = require('../controllers/aiController');

// Rate limiting for the AI chat endpoint to prevent abuse
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many requests to AI chat, please try again later.' }
});

// Route for event discovery chat
router.post('/', chatLimiter, chatWithAI);

module.exports = router;

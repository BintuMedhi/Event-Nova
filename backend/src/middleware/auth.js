const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

    // If database is offline, build a mock user from the decoded JWT payload
    if (global.dbOffline) {
      // Determine role from the mock user ID or use a default
      // The auth controller encodes the mock user with id 'mock_u123'
      // We reconstruct the role based on any role claim or default to 'organizer'
      req.user = {
        id: decoded.id || 'mock_u123',
        _id: decoded.id || 'mock_u123',
        role: decoded.role || 'organizer',
        name: decoded.name || 'Demo User',
        email: decoded.email || 'demo@eventnova.com',
      };
      return next();
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No user found with this token',
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

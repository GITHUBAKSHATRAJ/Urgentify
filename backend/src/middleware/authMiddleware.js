const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes via JWT verification
async function protect(req, res, next) {
  let token;

  // Check for Bearer token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database, excluding the password field
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }

      // Attach user object to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Authorization token verification failed:', error.message);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token validation failed'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided'
    });
  }
};

module.exports = { protect };

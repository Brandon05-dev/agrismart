const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid, user not found' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Middleware to check if user is a Farmer
const isFarmer = (req, res, next) => {
  if (req.user && req.user.role === 'Farmer') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Farmer role required.' 
    });
  }
};

// Middleware to check if user is a Buyer
const isBuyer = (req, res, next) => {
  if (req.user && req.user.role === 'Buyer') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Buyer role required.' 
    });
  }
};

// Middleware to check if user is either Farmer or Buyer (authenticated user)
const isAuthenticated = auth;

module.exports = {
  auth,
  isFarmer,
  isBuyer,
  isAuthenticated
};

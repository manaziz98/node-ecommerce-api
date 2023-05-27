const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const Item = require('../models/item');
// Middleware to validate the request body
const validateData = [
    // Specify validation rules using `body()` function
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),


    // Handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Validation errors occurred
        return res.status(400).json({ errors: errors.array() });
      }
      // Data is valid, proceed to the next middleware or route handler
      next();
    }
  ];

const validateSignupData = [
    body('username').notEmpty().withMessage('Username is required'),
    body('fullname').notEmpty().withMessage('fullname is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('role').isIn(['Admin', 'Owner', 'Client']).withMessage('Invalid role'),
    body('isActive').isBoolean().withMessage('isActive must be a boolean value'),

  
    // Handle validation errors
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Validation errors occurred
        return res.status(400).json({ errors: errors.array() });
      }
      // Data is valid, proceed to the next middleware or route handler
      next();
    }
  ];

// Middleware for checking authentication and authorization
const isAuth = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded token to the request object
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized ' + error.message });
  }
};

// Middleware for checking if the user is the owner of the item
const isOwner = async (req, res, next) => {
  try {
    // Get the item ID from the request parameters
    const itemId = req.params.id;

    // Find the item by ID
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if the authenticated user is the owner of the item
    
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error ' + error.message });
  }
};

// Middleware for checking if the user has at least one of the specified roles
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};


module.exports = {
    isAuth, 
    isOwner, 
    hasRole, 
    validateData,
    validateSignupData
}
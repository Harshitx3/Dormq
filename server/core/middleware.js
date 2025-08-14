/**
 * Middleware module for DormQ application
 * This module contains middleware functions used across the application
 */

const jwt = require('jsonwebtoken');
const { utils } = require('./index');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request object
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(utils.formatResponse(
        false, 
        'Authentication required. No token provided.'
      ));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user ID to request
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(utils.formatResponse(
        false, 
        'Invalid token. Please authenticate again.'
      ));
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json(utils.formatResponse(
        false, 
        'Token expired. Please login again.'
      ));
    }
    
    return res.status(500).json(utils.handleError(error, 'auth-middleware'));
  }
};

/**
 * Error handling middleware
 * Catches errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  res.status(statusCode).json(utils.formatResponse(
    false,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  ));
};

/**
 * Request logger middleware
 * Logs information about incoming requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log when request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

module.exports = {
  authenticate,
  errorHandler,
  requestLogger
};
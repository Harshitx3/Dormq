/**
 * Validation module for DormQ application
 * This module contains validation functions for user input
 */

/**
 * Validate user registration input
 * @param {object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {object} Validation result with errors if any
 */
const validateUserRegistration = (userData) => {
  const errors = {};
  
  // Validate name
  if (!userData.name || userData.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (userData.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Validate email
  if (!userData.email || userData.email.trim() === '') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.email = 'Please provide a valid email address';
    }
  }
  
  // Validate password
  if (!userData.password) {
    errors.password = 'Password is required';
  } else if (userData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(userData.password)) {
    errors.password = 'Password must contain at least one uppercase letter';
  } else if (!/[0-9]/.test(userData.password)) {
    errors.password = 'Password must contain at least one number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login input
 * @param {object} loginData - Login data
 * @param {string} loginData.email - User's email
 * @param {string} loginData.password - User's password
 * @returns {object} Validation result with errors if any
 */
const validateLogin = (loginData) => {
  const errors = {};
  
  // Validate email
  if (!loginData.email || loginData.email.trim() === '') {
    errors.email = 'Email is required';
  }
  
  // Validate password
  if (!loginData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate post creation input
 * @param {object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.content - Post content
 * @returns {object} Validation result with errors if any
 */
const validatePost = (postData) => {
  const errors = {};
  
  // Validate title
  if (!postData.title || postData.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (postData.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (postData.title.length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }
  
  // Validate content
  if (!postData.content || postData.content.trim() === '') {
    errors.content = 'Content is required';
  } else if (postData.content.length < 10) {
    errors.content = 'Content must be at least 10 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateUserRegistration,
  validateLogin,
  validatePost
};
/**
 * Test file for core modules
 * Run with: node core/test.js
 */

const { config, utils } = require('./index');
const validation = require('./validation');

console.log('Testing core modules...');

// Test config
console.log('\nConfig:');
console.log(config);

// Test utils
console.log('\nUtils:');
const successResponse = utils.formatResponse(true, 'Success', { id: 1 });
console.log('Success response:', successResponse);

const errorResponse = utils.handleError(new Error('Test error'), 'test');
console.log('Error response:', errorResponse);

const validEmail = utils.isValidEmail('test@example.com');
const invalidEmail = utils.isValidEmail('invalid-email');
console.log('Email validation:', { validEmail, invalidEmail });

// Test validation
console.log('\nValidation:');

const validUser = validation.validateUserRegistration({
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123'
});
console.log('Valid user:', validUser);

const invalidUser = validation.validateUserRegistration({
  name: 'T',
  email: 'invalid-email',
  password: 'pass'
});
console.log('Invalid user:', invalidUser);

const validLogin = validation.validateLogin({
  email: 'test@example.com',
  password: 'password'
});
console.log('Valid login:', validLogin);

const invalidLogin = validation.validateLogin({
  email: '',
  password: ''
});
console.log('Invalid login:', invalidLogin);

console.log('\nCore module tests completed!');
# DormQ Core Module

This directory contains the core modules for the DormQ application. These modules provide centralized functionality and utilities that can be used across the application.

## Modules

### `index.js`

The main entry point for the core module. It exports:

- `config`: Application configuration settings
- `utils`: Utility functions for common tasks

### `database.js`

Handles database connection and operations:

- `connect()`: Connect to MongoDB
- `disconnect()`: Disconnect from MongoDB
- `isConnected()`: Check connection status

### `middleware.js`

Contains middleware functions:

- `authenticate`: JWT authentication middleware
- `errorHandler`: Centralized error handling
- `requestLogger`: Logs information about incoming requests

### `validation.js`

Provides validation functions:

- `validateUserRegistration`: Validates user registration input
- `validateLogin`: Validates login input
- `validatePost`: Validates post creation input

## Usage

Import the required modules in your files:

```javascript
// Import core modules
const { config, utils } = require('./core');
const database = require('./core/database');
const { errorHandler, requestLogger } = require('./core/middleware');
const { validateUserRegistration } = require('./core/validation');

// Use the modules
app.use(errorHandler);

// Format response
res.json(utils.formatResponse(true, 'Success', data));

// Handle errors
res.status(500).json(utils.handleError(err, 'context'));

// Validate input
const validation = validateUserRegistration(userData);
if (!validation.isValid) {
  return res.status(400).json(utils.formatResponse(false, 'Validation failed', validation.errors));
}
```
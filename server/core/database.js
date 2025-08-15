/**
 * Database module for DormQ application
 * This module handles database connection and operations
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection promise
 */
const connect = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harsatta121:l1eJpNIOUPNLM8Ft@cluster097.sar7mjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster097';
    
    console.log('Connecting to MongoDB...');
    
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise} Mongoose disconnection promise
 */
const disconnect = async () => {
  try {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Check if connected to MongoDB
 * @returns {boolean} Connection status
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

module.exports = {
  connect,
  disconnect,
  isConnected
};
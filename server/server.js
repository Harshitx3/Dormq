const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded:', {
    port: process.env.PORT,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasMongoUri: !!process.env.MONGODB_URI
});

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: ['https://dormq.vercel.app', 'https://dormq.netlify.app'],
    credentials: true
}));
app.use(express.json());

// Static file serving with correct MIME types
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', (req, res, next) => {
    const ext = path.extname(req.url).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
    } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
    } else if (ext === '.gif') {
        res.setHeader('Content-Type', 'image/gif');
    }
    next();
}, express.static(path.join(__dirname, 'public/uploads')));

// API Routes - Use express.Router()
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');



// MongoDB connection
mongoose.connect('mongodb+srv://harsatta121:l1eJpNIOUPNLM8Ft@cluster097.sar7mjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster097', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Handle MongoDB connection errors
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
});

// Debug middleware for /api/posts route
app.use('/api/posts', (req, res, next) => {
    console.log('Posts route accessed:', {
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body
    });
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Serve HTML files
const htmlFiles = ['/', '/about', '/community', '/contact', '/home', '/login', 
                  '/my-posts', '/register', '/services', '/snacks-selection', 
                  '/stationery-selection', '/psit-only'];

htmlFiles.forEach(route => {
    app.get(route, (req, res) => {  // Make sure this is a function
        const fileName = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
        res.sendFile(path.join(__dirname, `../client/${fileName}`));
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong!';
    res.status(statusCode).json({
        message: message,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Handle 404 routes
app.use((req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, '../client/404.html'));
    } else {
        res.status(404).json({ message: 'Route not found' });
    }
});

// Start server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
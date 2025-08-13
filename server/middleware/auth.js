const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);

        const token = authHeader?.replace('Bearer ', '');
        console.log('Token extracted:', !!token);

        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, secret);
        console.log('Token verified, userId:', decoded.userId);

        req.user = { userId: decoded.userId };
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
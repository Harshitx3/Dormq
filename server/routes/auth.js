const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Import core modules
const { utils } = require('../core');
const { validateUserRegistration, validateLogin } = require('../core/validation');

// Register
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate user input
        const validation = validateUserRegistration({ name, email, password });
        if (!validation.isValid) {
            return res.status(400).json(utils.formatResponse(
                false,
                'Validation failed',
                validation.errors
            ));
        }

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json(utils.formatResponse(
                false,
                'User already exists'
            ));
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json(utils.formatResponse(
            true,
            'User registered successfully',
            {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        ));
    } catch (err) {
        console.error('Signup error:', err.message, err.stack);
        res.status(500).json(utils.handleError(err, 'signup'));
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validation = validateLogin({ email, password });
        if (!validation.isValid) {
            return res.status(400).json(utils.formatResponse(
                false,
                'Validation failed',
                validation.errors
            ));
        }

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json(utils.formatResponse(
                false,
                'Invalid credentials'
            ));
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json(utils.formatResponse(
                false,
                'Invalid credentials'
            ));
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json(utils.formatResponse(
            true,
            'Login successful',
            {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name
                }
            }
        ));
    } catch (err) {
        console.error('Login error:', err.message, err.stack);
        res.status(500).json(utils.handleError(err, 'login'));
    }
});

module.exports = router;
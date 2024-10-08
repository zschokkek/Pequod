const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify token and set req.username
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

        req.username = decoded.username;
        console.log(`Verified token for username: ${req.username}`); // Add logging
        next();
    });
}
// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and assign token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            userId: user._id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

router.post('/guess', async (req, res) => {
    const { username, lat, lng, score } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.error(`User not found: ${username}`);
            return res.status(404).json({ message: 'User not found' });
        } else {
            console.log(user)
        }

        user.guesses.push({ lat, lng, score });
        await user.save();
        res.status(200).json({ message: 'Guess saved successfully' });
    } catch (err) {
        console.error('Server error:', err.message, err.stack);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});


// Get Guesses route by username 
router.get('/guesses', async (req, res) => {
    const { username } = req.query; // Get username from query parameter
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.guesses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});



// List Users (for debugging)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
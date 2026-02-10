/**
 * Auth Routes — Handles admin user authentication.
 * POST /api/auth/login — Validate credentials and return a JWT.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin user and return JWT
 * @access  Public
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { email, password } = req.body;

            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Compare password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token (valid for 24 hours)
            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: { id: user._id, email: user.email },
            });
        } catch (err) {
            console.error('Login error:', err.message);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

module.exports = router;

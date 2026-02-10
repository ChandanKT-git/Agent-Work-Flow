/**
 * Agent Routes — CRUD operations for managing agents.
 * All routes are protected by JWT auth middleware.
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const ListItem = require('../models/ListItem');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all agent routes
router.use(auth);

/**
 * @route   GET /api/agents
 * @desc    Get all agents
 * @access  Private
 */
router.get('/', async (_req, res) => {
    try {
        const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
        res.json(agents);
    } catch (err) {
        console.error('Get agents error:', err.message);
        res.status(500).json({ message: 'Server error fetching agents' });
    }
});

/**
 * @route   POST /api/agents
 * @desc    Create a new agent
 * @access  Private
 */
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('countryCode').trim().notEmpty().withMessage('Country code is required'),
        body('mobile')
            .trim()
            .notEmpty()
            .withMessage('Mobile number is required')
            .isNumeric()
            .withMessage('Mobile number must contain only digits'),
        body('password')
            .isLength({ min: 4 })
            .withMessage('Password must be at least 4 characters'),
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const { name, email, countryCode, mobile, password } = req.body;

            // Check if agent with this email already exists
            const existingAgent = await Agent.findOne({ email: email.toLowerCase() });
            if (existingAgent) {
                return res.status(400).json({ message: 'An agent with this email already exists' });
            }

            // Create and save new agent
            const agent = new Agent({ name, email, countryCode, mobile, password });
            await agent.save();

            // Return agent without password
            const agentResponse = agent.toObject();
            delete agentResponse.password;

            res.status(201).json({ message: 'Agent created successfully', agent: agentResponse });
        } catch (err) {
            console.error('Create agent error:', err.message);
            res.status(500).json({ message: 'Server error creating agent' });
        }
    }
);

/**
 * @route   PUT /api/agents/:id
 * @desc    Update an existing agent
 * @access  Private
 */
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Please enter a valid email'),
        body('countryCode').optional().trim().notEmpty().withMessage('Country code cannot be empty'),
        body('mobile')
            .optional()
            .trim()
            .notEmpty()
            .withMessage('Mobile number cannot be empty')
            .isNumeric()
            .withMessage('Mobile number must contain only digits'),
        body('password')
            .optional()
            .isLength({ min: 4 })
            .withMessage('Password must be at least 4 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: errors.array()[0].msg });
            }

            const agent = await Agent.findById(req.params.id);
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found' });
            }

            // Update fields if provided
            const { name, email, countryCode, mobile, password } = req.body;
            if (name) agent.name = name;
            if (email) agent.email = email;
            if (countryCode) agent.countryCode = countryCode;
            if (mobile) agent.mobile = mobile;
            if (password) agent.password = password; // pre-save hook will hash it

            await agent.save();

            const agentResponse = agent.toObject();
            delete agentResponse.password;

            res.json({ message: 'Agent updated successfully', agent: agentResponse });
        } catch (err) {
            console.error('Update agent error:', err.message);
            res.status(500).json({ message: 'Server error updating agent' });
        }
    }
);

/**
 * @route   DELETE /api/agents/:id
 * @desc    Delete an agent and their assigned list items
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        // Remove all list items assigned to this agent
        await ListItem.deleteMany({ agentId: agent._id });

        // Delete the agent
        await Agent.findByIdAndDelete(req.params.id);

        res.json({ message: 'Agent and assigned items deleted successfully' });
    } catch (err) {
        console.error('Delete agent error:', err.message);
        res.status(500).json({ message: 'Server error deleting agent' });
    }
});

module.exports = router;

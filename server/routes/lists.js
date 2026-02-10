/**
 * List Routes — Handle CSV/XLSX upload, parsing, validation,
 * equal distribution among agents, and fetching distributed lists.
 */

const express = require('express');
const XLSX = require('xlsx');
const Agent = require('../models/Agent');
const ListItem = require('../models/ListItem');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all list routes
router.use(auth);

/**
 * @route   POST /api/lists/upload
 * @desc    Upload a CSV/XLSX/XLS file, validate it, distribute items among agents
 * @access  Private
 */
router.post('/upload', (req, res) => {
    // Use multer to handle single file upload (field name: "file")
    upload.single('file')(req, res, async (err) => {
        // Handle multer errors (e.g., invalid file type)
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        // Ensure a file was actually uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file (CSV, XLSX, or XLS)' });
        }

        try {
            // ---- 1. Parse the uploaded file using xlsx ----
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                return res.status(400).json({ message: 'The uploaded file has no sheets' });
            }

            const worksheet = workbook.Sheets[sheetName];
            const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (rawData.length === 0) {
                return res.status(400).json({ message: 'The uploaded file is empty' });
            }

            // ---- 2. Validate columns ----
            // Accept flexible column naming (case-insensitive matching)
            const firstRow = rawData[0];
            const columns = Object.keys(firstRow);
            const columnMap = {};

            for (const col of columns) {
                const lower = col.toLowerCase().trim();
                if (lower === 'firstname' || lower === 'first name' || lower === 'first_name') {
                    columnMap.firstName = col;
                } else if (lower === 'phone' || lower === 'phonenumber' || lower === 'phone_number') {
                    columnMap.phone = col;
                } else if (lower === 'notes' || lower === 'note') {
                    columnMap.notes = col;
                }
            }

            if (!columnMap.firstName || !columnMap.phone) {
                return res.status(400).json({
                    message:
                        'Invalid file format. The file must contain "FirstName" and "Phone" columns. "Notes" is optional.',
                });
            }

            // ---- 3. Parse and validate each row ----
            const items = [];
            const errors = [];

            rawData.forEach((row, index) => {
                const firstName = String(row[columnMap.firstName] || '').trim();
                const phone = String(row[columnMap.phone] || '').trim();
                const notes = columnMap.notes ? String(row[columnMap.notes] || '').trim() : '';

                if (!firstName) {
                    errors.push(`Row ${index + 2}: FirstName is missing`);
                    return;
                }
                if (!phone) {
                    errors.push(`Row ${index + 2}: Phone is missing`);
                    return;
                }

                items.push({ firstName, phone, notes });
            });

            if (items.length === 0) {
                return res.status(400).json({
                    message: 'No valid items found in the file',
                    errors: errors.slice(0, 10), // Show first 10 errors max
                });
            }

            // ---- 4. Get all agents ----
            const agents = await Agent.find().sort({ createdAt: 1 });

            if (agents.length === 0) {
                return res.status(400).json({
                    message: 'No agents found. Please add agents before uploading a list.',
                });
            }

            // ---- 5. Distribute items equally among agents ----
            const totalAgents = agents.length;
            const totalItems = items.length;
            const baseCount = Math.floor(totalItems / totalAgents);
            const remainder = totalItems % totalAgents;

            // Delete previously distributed items (fresh distribution)
            await ListItem.deleteMany({});

            const distributedItems = [];
            let currentIndex = 0;

            for (let i = 0; i < totalAgents; i++) {
                // First `remainder` agents get one extra item
                const count = baseCount + (i < remainder ? 1 : 0);
                const agentItems = items.slice(currentIndex, currentIndex + count);

                for (const item of agentItems) {
                    distributedItems.push({
                        firstName: item.firstName,
                        phone: item.phone,
                        notes: item.notes,
                        agentId: agents[i]._id,
                    });
                }

                currentIndex += count;
            }

            // ---- 6. Save all distributed items to the database ----
            await ListItem.insertMany(distributedItems);

            // ---- 7. Build response grouped by agent ----
            const result = agents.map((agent, i) => {
                const count = baseCount + (i < remainder ? 1 : 0);
                return {
                    agent: {
                        _id: agent._id,
                        name: agent.name,
                        email: agent.email,
                    },
                    itemCount: count,
                };
            });

            res.json({
                message: `Successfully distributed ${totalItems} items among ${totalAgents} agents`,
                totalItems,
                totalAgents,
                distribution: result,
                warnings: errors.length > 0 ? errors.slice(0, 10) : undefined,
            });
        } catch (parseErr) {
            console.error('File parsing error:', parseErr.message);
            res.status(400).json({ message: 'Error parsing the uploaded file. Please check the format.' });
        }
    });
});

/**
 * @route   GET /api/lists
 * @desc    Get all distributed list items grouped by agent
 * @access  Private
 */
router.get('/', async (_req, res) => {
    try {
        const agents = await Agent.find().select('-password').sort({ createdAt: 1 });

        // Build response with items for each agent
        const distribution = await Promise.all(
            agents.map(async (agent) => {
                const items = await ListItem.find({ agentId: agent._id }).sort({ createdAt: 1 });
                return {
                    agent: {
                        _id: agent._id,
                        name: agent.name,
                        email: agent.email,
                    },
                    items,
                    itemCount: items.length,
                };
            })
        );

        const totalItems = distribution.reduce((sum, d) => sum + d.itemCount, 0);

        res.json({ totalItems, totalAgents: agents.length, distribution });
    } catch (err) {
        console.error('Get lists error:', err.message);
        res.status(500).json({ message: 'Server error fetching distributed lists' });
    }
});

module.exports = router;

/**
 * server.js — Main entry point for the Express backend.
 * Connects to MongoDB, registers middleware, and mounts API routes.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config();

const app = express();

// --------------- Middleware ---------------
app.use(cors()); // Enable CORS for all origins (dev)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// --------------- API Routes ---------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/lists', require('./routes/lists'));

// Health check route
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --------------- Global Error Handler ---------------
app.use((err, _req, res, _next) => {
    console.error('Unhandled Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// --------------- Database Connection & Server Start ---------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agent-distribution';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

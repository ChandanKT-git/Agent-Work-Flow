/**
 * seed.js — Creates a default admin user if one does not exist.
 * Run with: npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agent-distribution';

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });

        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists. Skipping seed.');
        } else {
            const admin = new User({
                email: 'admin@example.com',
                password: 'admin123',
            });
            await admin.save();
            console.log('✅ Default admin user created:');
            console.log('   Email:    admin@example.com');
            console.log('   Password: admin123');
        }

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err.message);
        process.exit(1);
    }
}

seed();

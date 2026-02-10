/**
 * Agent Model — Represents an agent that receives distributed list items.
 * Fields: name, email (unique), mobile (with countryCode), password
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const agentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Agent name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Agent email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        countryCode: {
            type: String,
            required: [true, 'Country code is required'],
            trim: true,
            default: '+91',
        },
        mobile: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [4, 'Password must be at least 4 characters'],
        },
    },
    { timestamps: true }
);

/**
 * Pre-save hook: Hash the password before saving if it has been modified.
 */
agentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('Agent', agentSchema);

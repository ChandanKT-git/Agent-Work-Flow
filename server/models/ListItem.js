/**
 * ListItem Model — Represents a single item from an uploaded CSV/XLSX,
 * distributed to an agent.
 * Fields: firstName, phone, notes, agentId (ref → Agent)
 */

const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
            default: '',
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: [true, 'Agent ID is required'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ListItem', listItemSchema);

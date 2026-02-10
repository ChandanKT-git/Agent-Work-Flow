/**
 * User Model — Represents an admin user who can log in.
 * Fields: email (unique, required), password (hashed, required)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * Instance method: Compare a candidate password with the stored hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

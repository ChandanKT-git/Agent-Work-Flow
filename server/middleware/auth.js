/**
 * Auth Middleware — Verifies the JWT token from the Authorization header.
 * Attaches the decoded user payload to req.user on success.
 */

const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
    // Expect header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

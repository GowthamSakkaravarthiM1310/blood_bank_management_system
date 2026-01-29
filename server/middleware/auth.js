import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header or cookie
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || req.cookies?.token;

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database (use decoded.id which is set in auth.js)
        const users = await query('SELECT id, email, name, role, blood_type, avatar_url, user_type, blood_bank_id FROM users WHERE id = ?', [decoded.id || decoded.userId]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found.' });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1] || req.cookies?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const users = await query('SELECT id, email, name, role, blood_type, avatar_url, user_type, blood_bank_id FROM users WHERE id = ?', [decoded.id || decoded.userId]);
            if (users.length > 0) {
                req.user = users[0];
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Admin only middleware
export const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
};

// Generate JWT token
export const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

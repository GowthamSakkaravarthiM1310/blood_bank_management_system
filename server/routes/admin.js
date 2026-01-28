import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'blood-bank-jwt-secret';
const ADMIN_PASSWORD = '250621';

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;

        if (password === ADMIN_PASSWORD) {
            const [rows] = await pool.query('SELECT * FROM users WHERE role = ?', ['admin']);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Admin account not found' });
            }

            const admin = rows[0];
            const token = jwt.sign(
                { id: admin.id, email: admin.email, role: 'admin' },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                token,
                user: { id: admin.id, email: admin.email, name: admin.name, role: 'admin' }
            });
        } else {
            res.status(401).json({ error: 'Invalid admin password' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify admin middleware
const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get all users
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, username, email, firstname, lastname, name, age, phone, blood_type, 
              state, district, city_village, role, email_verified, created_at 
       FROM users ORDER BY created_at DESC`
        );
        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user
router.get('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, username, email, firstname, lastname, name, age, phone, blood_type, 
              state, district, city_village, role, email_verified, avatar_url, created_at 
       FROM users WHERE id = ?`,
            [req.params.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ user: users[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.put('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const { firstname, lastname, name, age, phone, blood_type, state, district, city_village, role } = req.body;
        await pool.query(
            `UPDATE users SET firstname = ?, lastname = ?, name = ?, age = ?, phone = ?, 
       blood_type = ?, state = ?, district = ?, city_village = ?, role = ? WHERE id = ?`,
            [firstname, lastname, name, age, phone, blood_type, state, district, city_village, role, req.params.id]
        );
        res.json({ success: true, message: 'User updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const [user] = await pool.query('SELECT role FROM users WHERE id = ?', [req.params.id]);
        if (user.length > 0 && user[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin' });
        }
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all donors
router.get('/donors', verifyAdmin, async (req, res) => {
    try {
        const [donors] = await pool.query(
            `SELECT d.*, u.email as user_email, u.username FROM donors d 
       LEFT JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC`
        );
        res.json({ donors });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch donors' });
    }
});

// Get all blood requests
router.get('/requests', verifyAdmin, async (req, res) => {
    try {
        const [requests] = await pool.query(
            `SELECT r.*, u.email as user_email, u.username, u.name as user_name FROM blood_requests r 
       LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`
        );
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Get blood banks with inventory
router.get('/banks', verifyAdmin, async (req, res) => {
    try {
        const [banks] = await pool.query('SELECT * FROM blood_banks ORDER BY id');
        for (let bank of banks) {
            const [inventory] = await pool.query('SELECT blood_type, units FROM blood_inventory WHERE bank_id = ?', [bank.id]);
            bank.inventory = inventory;
        }
        res.json({ banks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch banks' });
    }
});

// Update blood inventory
router.put('/inventory/:bankId/:bloodType', verifyAdmin, async (req, res) => {
    try {
        const { bankId, bloodType } = req.params;
        const { units } = req.body;
        await pool.query('UPDATE blood_inventory SET units = ? WHERE bank_id = ? AND blood_type = ?', [units, bankId, bloodType]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});

// Dashboard stats
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role != ?', ['admin']);
        const [donorCount] = await pool.query('SELECT COUNT(*) as count FROM donors');
        const [requestCount] = await pool.query('SELECT COUNT(*) as count FROM blood_requests');
        const [pendingRequests] = await pool.query('SELECT COUNT(*) as count FROM blood_requests WHERE status = ?', ['pending']);
        const [bankCount] = await pool.query('SELECT COUNT(*) as count FROM blood_banks');

        res.json({
            stats: {
                users: userCount[0].count,
                donors: donorCount[0].count,
                requests: requestCount[0].count,
                pendingRequests: pendingRequests[0].count,
                banks: bankCount[0].count
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;

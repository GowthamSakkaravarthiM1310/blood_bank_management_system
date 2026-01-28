import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'blood-bank-jwt-secret';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'), false);
        }
    }
});

// Upload profile image
router.post('/profile-image', upload.single('image'), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!req.file) return res.status(400).json({ error: 'No image' });

        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [base64Image, decoded.id]);

        res.json({ success: true, avatar_url: base64Image });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get profile image
router.get('/profile-image/:userId', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT avatar_url FROM users WHERE id = ?', [req.params.userId]);
        if (users.length === 0 || !users[0].avatar_url) {
            return res.status(404).json({ error: 'No image' });
        }
        res.json({ avatar_url: users[0].avatar_url });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get image' });
    }
});

// Delete profile image
router.delete('/profile-image', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        await pool.query('UPDATE users SET avatar_url = NULL WHERE id = ?', [decoded.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

export default router;

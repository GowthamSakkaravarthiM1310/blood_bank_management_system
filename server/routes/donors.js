import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all donors
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
    const { bloodGroup, available } = req.query;

    let sql = 'SELECT * FROM donors';
    const params = [];
    const conditions = [];

    if (bloodGroup) {
        conditions.push('blood_group = ?');
        params.push(bloodGroup);
    }

    if (available !== undefined) {
        conditions.push('is_available = ?');
        params.push(available === 'true');
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const donors = await query(sql, params);
    res.json({ donors });
}));

// Get single donor
router.get('/:id', asyncHandler(async (req, res) => {
    const donors = await query('SELECT * FROM donors WHERE id = ?', [req.params.id]);

    if (donors.length === 0) {
        return res.status(404).json({ error: 'Donor not found' });
    }

    res.json({ donor: donors[0] });
}));

// Create new donor
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, bloodGroup, phone, email } = req.body;

    if (!name || !bloodGroup) {
        return res.status(400).json({ error: 'Name and blood group are required' });
    }

    const result = await query(
        `INSERT INTO donors (user_id, name, blood_group, phone, email) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, name, bloodGroup, phone || null, email || null]
    );

    const newDonor = {
        id: result.insertId,
        user_id: req.user.id,
        name,
        blood_group: bloodGroup,
        phone,
        email
    };

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('donor:created', newDonor);

    res.status(201).json({ donor: newDonor });
}));

// Update donor
router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { name, bloodGroup, phone, email, isAvailable } = req.body;
    const donorId = req.params.id;

    // Check if donor belongs to user (unless admin)
    const donors = await query('SELECT * FROM donors WHERE id = ?', [donorId]);
    if (donors.length === 0) {
        return res.status(404).json({ error: 'Donor not found' });
    }

    if (donors[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this donor' });
    }

    await query(
        `UPDATE donors SET 
      name = COALESCE(?, name),
      blood_group = COALESCE(?, blood_group),
      phone = COALESCE(?, phone),
      email = COALESCE(?, email),
      is_available = COALESCE(?, is_available)
    WHERE id = ?`,
        [name, bloodGroup, phone, email, isAvailable, donorId]
    );

    const updatedDonors = await query('SELECT * FROM donors WHERE id = ?', [donorId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('donor:updated', updatedDonors[0]);

    res.json({ donor: updatedDonors[0] });
}));

// Delete donor
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const donorId = req.params.id;

    // Check if donor belongs to user (unless admin)
    const donors = await query('SELECT * FROM donors WHERE id = ?', [donorId]);
    if (donors.length === 0) {
        return res.status(404).json({ error: 'Donor not found' });
    }

    if (donors[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this donor' });
    }

    await query('DELETE FROM donors WHERE id = ?', [donorId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('donor:deleted', { id: parseInt(donorId) });

    res.json({ message: 'Donor deleted successfully' });
}));

export default router;

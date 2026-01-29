import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware to verify blood bank user
const verifyBloodBankUser = async (req, res, next) => {
    if (req.user.user_type !== 'blood_bank') {
        return res.status(403).json({ error: 'Blood bank user access required' });
    }
    if (!req.user.blood_bank_id) {
        return res.status(400).json({ error: 'No blood bank associated with this account' });
    }
    next();
};

// Get user's associated blood bank with inventory
router.get('/bank', authenticateToken, verifyBloodBankUser, asyncHandler(async (req, res) => {
    const bankId = req.user.blood_bank_id;

    const banks = await query('SELECT * FROM blood_banks WHERE id = ?', [bankId]);
    if (banks.length === 0) {
        return res.status(404).json({ error: 'Blood bank not found' });
    }

    const inventory = await query(
        'SELECT blood_type, units, last_updated FROM blood_inventory WHERE bank_id = ? ORDER BY blood_type',
        [bankId]
    );

    res.json({
        bank: banks[0],
        inventory
    });
}));

// Update blood bank details
router.patch('/bank', authenticateToken, verifyBloodBankUser, asyncHandler(async (req, res) => {
    const bankId = req.user.blood_bank_id;
    const { name, location, phone, hours } = req.body;

    await query(
        'UPDATE blood_banks SET name = COALESCE(?, name), location = COALESCE(?, location), phone = COALESCE(?, phone), hours = COALESCE(?, hours) WHERE id = ?',
        [name, location, phone, hours, bankId]
    );

    const banks = await query('SELECT * FROM blood_banks WHERE id = ?', [bankId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('bank:updated', banks[0]);

    res.json({ bank: banks[0] });
}));

// Update blood inventory (real-time)
router.patch('/inventory', authenticateToken, verifyBloodBankUser, asyncHandler(async (req, res) => {
    const bankId = req.user.blood_bank_id;
    const { bloodType, units, action } = req.body;

    if (!bloodType || units === undefined) {
        return res.status(400).json({ error: 'Blood type and units are required' });
    }

    // Check if inventory exists
    const existing = await query(
        'SELECT * FROM blood_inventory WHERE bank_id = ? AND blood_type = ?',
        [bankId, bloodType]
    );

    if (existing.length === 0) {
        // Create new inventory entry
        await query(
            'INSERT INTO blood_inventory (bank_id, blood_type, units) VALUES (?, ?, ?)',
            [bankId, bloodType, units]
        );
    } else {
        // Update existing
        let newUnits = units;
        if (action === 'add') {
            newUnits = existing[0].units + units;
        } else if (action === 'subtract') {
            newUnits = Math.max(0, existing[0].units - units);
        }

        await query(
            'UPDATE blood_inventory SET units = ?, last_updated = NOW() WHERE bank_id = ? AND blood_type = ?',
            [newUnits, bankId, bloodType]
        );
    }

    // Get updated inventory
    const updatedInventory = await query(
        'SELECT blood_type, units, last_updated FROM blood_inventory WHERE bank_id = ?',
        [bankId]
    );

    // Get bank details for emit
    const banks = await query('SELECT * FROM blood_banks WHERE id = ?', [bankId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('inventory:updated', {
        bankId: parseInt(bankId),
        inventory: updatedInventory,
        bank: banks[0]
    });

    // Emit alert if low stock
    const lowStockItems = updatedInventory.filter(item => item.units < 5);
    if (lowStockItems.length > 0) {
        io.emit('notification', {
            type: 'low_stock',
            message: `Low blood stock alert: ${lowStockItems.map(i => i.blood_type).join(', ')}`,
            bankId: parseInt(bankId)
        });
    }

    res.json({ inventory: updatedInventory });
}));

// Get all blood requests (for blood bank users to see incoming requests)
router.get('/requests', authenticateToken, verifyBloodBankUser, asyncHandler(async (req, res) => {
    const requests = await query(
        `SELECT br.*, u.name as requester_name, u.email as requester_email, u.phone as requester_phone 
         FROM blood_requests br 
         LEFT JOIN users u ON br.user_id = u.id 
         ORDER BY br.created_at DESC`
    );

    res.json({ requests });
}));

export default router;

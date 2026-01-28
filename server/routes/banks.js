import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all blood banks with inventory
router.get('/', asyncHandler(async (req, res) => {
    const { search } = req.query;

    let sql = `
    SELECT bb.*, 
      (SELECT JSON_ARRAYAGG(JSON_OBJECT('blood_type', bi.blood_type, 'units', bi.units))
       FROM blood_inventory bi WHERE bi.bank_id = bb.id) as inventory
    FROM blood_banks bb
  `;
    const params = [];

    if (search) {
        sql += ' WHERE bb.name LIKE ? OR bb.location LIKE ?';
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY bb.name';

    const banks = await query(sql, params);

    // Parse inventory JSON and restructure for frontend
    const formattedBanks = banks.map(bank => {
        let inventory = bank.inventory;
        if (typeof inventory === 'string') {
            try {
                inventory = JSON.parse(inventory);
            } catch (e) {
                inventory = [];
            }
        }

        // Convert to object format expected by frontend
        const inventoryObj = {};
        if (Array.isArray(inventory)) {
            inventory.forEach(item => {
                if (item && item.blood_type) {
                    // Map blood types to simple keys (A+, A-, etc. -> A, B, O, AB)
                    const typeKey = item.blood_type.replace('+', '').replace('-', '');
                    inventoryObj[typeKey] = (inventoryObj[typeKey] || 0) + item.units;
                }
            });
        }

        return {
            ...bank,
            A: inventoryObj.A || 0,
            B: inventoryObj.B || 0,
            O: inventoryObj.O || 0,
            AB: inventoryObj.AB || 0,
            inventory
        };
    });

    res.json({ banks: formattedBanks });
}));

// Get single bank with inventory
router.get('/:id', asyncHandler(async (req, res) => {
    const banks = await query('SELECT * FROM blood_banks WHERE id = ?', [req.params.id]);

    if (banks.length === 0) {
        return res.status(404).json({ error: 'Blood bank not found' });
    }

    const inventory = await query(
        'SELECT blood_type, units FROM blood_inventory WHERE bank_id = ?',
        [req.params.id]
    );

    res.json({
        bank: banks[0],
        inventory
    });
}));

// Get bank inventory
router.get('/:id/inventory', asyncHandler(async (req, res) => {
    const inventory = await query(
        'SELECT blood_type, units, last_updated FROM blood_inventory WHERE bank_id = ? ORDER BY blood_type',
        [req.params.id]
    );

    res.json({ inventory });
}));

// Update bank inventory (admin only)
router.patch('/:id/inventory', authenticateToken, asyncHandler(async (req, res) => {
    const { bloodType, units, action } = req.body;
    const bankId = req.params.id;

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
            'UPDATE blood_inventory SET units = ? WHERE bank_id = ? AND blood_type = ?',
            [newUnits, bankId, bloodType]
        );
    }

    // Get updated inventory
    const updatedInventory = await query(
        'SELECT blood_type, units FROM blood_inventory WHERE bank_id = ?',
        [bankId]
    );

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('inventory:updated', {
        bankId: parseInt(bankId),
        inventory: updatedInventory
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

// Create new blood bank (admin only)
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, location, phone, hours } = req.body;

    if (!name || !location) {
        return res.status(400).json({ error: 'Name and location are required' });
    }

    const result = await query(
        'INSERT INTO blood_banks (name, location, phone, hours) VALUES (?, ?, ?, ?)',
        [name, location, phone || null, hours || null]
    );

    const newBank = {
        id: result.insertId,
        name,
        location,
        phone,
        hours
    };

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('bank:created', newBank);

    res.status(201).json({ bank: newBank });
}));

export default router;

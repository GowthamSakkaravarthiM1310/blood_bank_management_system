import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all blood requests
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
    const { bloodType, status, urgency } = req.query;

    let sql = `
    SELECT br.*, u.name as requester_name, u.email as requester_email 
    FROM blood_requests br 
    LEFT JOIN users u ON br.user_id = u.id
  `;
    const params = [];
    const conditions = [];

    if (bloodType) {
        conditions.push('br.blood_type = ?');
        params.push(bloodType);
    }

    if (status) {
        conditions.push('br.status = ?');
        params.push(status);
    }

    if (urgency) {
        conditions.push('br.urgency = ?');
        params.push(urgency);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY br.created_at DESC';

    const requests = await query(sql, params);
    res.json({ requests });
}));

// Get single request
router.get('/:id', asyncHandler(async (req, res) => {
    const requests = await query(
        `SELECT br.*, u.name as requester_name, u.email as requester_email 
     FROM blood_requests br 
     LEFT JOIN users u ON br.user_id = u.id 
     WHERE br.id = ?`,
        [req.params.id]
    );

    if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request: requests[0] });
}));

// Create blood request
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { patientName, bloodType, unitsNeeded, hospital, location, urgency, urgencyNote } = req.body;

    if (!patientName || !bloodType || !hospital) {
        return res.status(400).json({ error: 'Patient name, blood type, and hospital are required' });
    }

    const result = await query(
        `INSERT INTO blood_requests 
     (user_id, patient_name, blood_type, units_needed, hospital, location, urgency, urgency_note) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, patientName, bloodType, unitsNeeded || 1, hospital, location || null, urgency || 'normal', urgencyNote || null]
    );

    const newRequest = {
        id: result.insertId,
        user_id: req.user.id,
        patient_name: patientName,
        blood_type: bloodType,
        units_needed: unitsNeeded || 1,
        hospital,
        location,
        urgency: urgency || 'normal',
        urgency_note: urgencyNote,
        status: 'pending',
        requester_name: req.user.name
    };

    // Emit real-time notification for urgent requests
    const io = req.app.get('io');
    io.emit('request:created', newRequest);

    if (urgency === 'urgent' || urgency === 'critical') {
        io.emit('notification', {
            type: 'urgent_request',
            message: `Urgent ${bloodType} blood needed at ${hospital}`,
            request: newRequest
        });
    }

    res.status(201).json({ request: newRequest });
}));

// Update request status
router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { status, unitsNeeded } = req.body;
    const requestId = req.params.id;

    // Get request
    const requests = await query('SELECT * FROM blood_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }

    // Only requester or admin can update
    if (requests[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    await query(
        `UPDATE blood_requests SET 
      status = COALESCE(?, status),
      units_needed = COALESCE(?, units_needed)
    WHERE id = ?`,
        [status, unitsNeeded, requestId]
    );

    const updatedRequests = await query('SELECT * FROM blood_requests WHERE id = ?', [requestId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('request:updated', updatedRequests[0]);

    res.json({ request: updatedRequests[0] });
}));

// Delete request
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const requestId = req.params.id;

    const requests = await query('SELECT * FROM blood_requests WHERE id = ?', [requestId]);
    if (requests.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
    }

    if (requests[0].user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this request' });
    }

    await query('DELETE FROM blood_requests WHERE id = ?', [requestId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('request:deleted', { id: parseInt(requestId) });

    res.json({ message: 'Request deleted successfully' });
}));

export default router;

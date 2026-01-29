import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import pool from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'blood-bank-jwt-secret';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, age, phone, bloodType, state, district, cityVillage } = req.body;

        if (!username || !email || !password || !firstname || !lastname) {
            return res.status(400).json({ error: 'Required: username, email, password, firstname, lastname' });
        }

        // Check existing username
        const [existingUsername] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Check existing email
        const [existingEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const fullName = `${firstname} ${lastname}`;
        const location = `${cityVillage || ''}, ${district || ''}, ${state || ''}, India`;

        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, firstname, lastname, name, age, phone, blood_type, state, district, city_village, location, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
            [username, email, hashedPassword, firstname, lastname, fullName, age || null, phone || null, bloodType || null, state || null, district || null, cityVillage || null, location]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now login.',
            userId: result.insertId,
            email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});



// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const [users] = await pool.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Username not found. Please create an account first.' });
        }

        const user = users[0];

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Incorrect password' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id, username: user.username, email: user.email, name: user.name,
                firstname: user.firstname, lastname: user.lastname, age: user.age, phone: user.phone,
                blood_type: user.blood_type, state: user.state, district: user.district,
                city_village: user.city_village, location: user.location, avatar_url: user.avatar_url, role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
    (req, res) => {
        const token = jwt.sign({ id: req.user.id, email: req.user.email, role: req.user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
    }
);

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const [users] = await pool.query(
            'SELECT id, username, email, name, firstname, lastname, age, phone, blood_type, state, district, city_village, location, avatar_url, role, google_id FROM users WHERE id = ?',
            [decoded.id]
        );
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ user: users[0] });

    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, phone, location, bloodType, state, district, cityVillage } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, phone = ?, location = ?, blood_type = ?, state = ?, district = ?, city_village = ? WHERE id = ?',
            [name, phone, location, bloodType, state, district, cityVillage, decoded.id]
        );

        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        res.json({ success: true, user: users[0] });

    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Complete profile for new Google users
router.post('/complete-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const { username, password, phone, bloodType, state, district, cityVillage } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Check if username already exists
        const [existingUsername] = await pool.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, decoded.id]);
        if (existingUsername.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const location = `${cityVillage || ''}, ${district || ''}, ${state || ''}, India`.replace(/^, |, $/g, '');

        // Build update query
        let updateQuery = 'UPDATE users SET username = ?, phone = ?, blood_type = ?, state = ?, district = ?, city_village = ?, location = ?';
        let params = [username, phone || null, bloodType || null, state || null, district || null, cityVillage || null, location || null];

        // Hash and add password if provided
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery += ', password = ?';
            params.push(hashedPassword);
        }

        updateQuery += ' WHERE id = ?';
        params.push(decoded.id);

        await pool.query(updateQuery, params);

        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        res.json({ success: true, user: users[0] });

    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({ error: 'Failed to complete profile' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.logout?.(() => { });
    res.json({ success: true });
});

export default router;


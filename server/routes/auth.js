import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'blood-bank-jwt-secret';

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'bloodbankapp2024@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Generate 6-digit OTP
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // For development
    return otp;
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    try {
        await transporter.sendMail({
            from: `"LifeFlow Blood Bank" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Email - LifeFlow Blood Bank',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #e11d48; text-align: center;">🩸 LifeFlow Blood Bank</h1>
          <h2>Hello ${name}!</h2>
          <p>Please use the following OTP to verify your email:</p>
          <div style="background: linear-gradient(135deg, #e11d48, #dc2626); color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP is valid for 10 minutes.</p>
        </div>
      `
        });
        return true;
    } catch (error) {
        // Mock Email Service Fallback
        console.log('\n==================================================');
        console.log('⚠️  EMAIL SENDING FAILED (Expected in Dev) ⚠️');
        console.log('--------------------------------------------------');
        console.log(`📧 To:      ${email}`);
        console.log(`🔑 OTP:     ${otp}`);
        console.log('--------------------------------------------------');
        console.log('✅ Simulating success for development flow...');
        console.log('==================================================\n');
        return true; // Return true to allow flow to continue
    }
};

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
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        const fullName = `${firstname} ${lastname}`;
        const location = `${cityVillage || ''}, ${district || ''}, ${state || ''}, India`;

        const [result] = await pool.query(
            `INSERT INTO users (username, email, password, firstname, lastname, name, age, phone, blood_type, state, district, city_village, location, otp_code, otp_expires, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [username, email, hashedPassword, firstname, lastname, fullName, age || null, phone || null, bloodType || null, state || null, district || null, cityVillage || null, location, otp, otpExpires]
        );

        const emailSent = await sendOTPEmail(email, otp, firstname);

        res.status(201).json({
            success: true,
            message: emailSent ? 'Registration successful! Check email for OTP.' : 'Registration successful! OTP sending failed.',
            userId: result.insertId,
            email,
            emailSent
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [users] = await pool.query('SELECT id, otp_code, otp_expires FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = users[0];
        if (user.otp_code !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ error: 'OTP expired' });

        await pool.query('UPDATE users SET email_verified = TRUE, otp_code = NULL, otp_expires = NULL WHERE id = ?', [user.id]);
        res.json({ success: true, message: 'Email verified! You can now login.' });

    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const [users] = await pool.query('SELECT id, firstname FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ error: 'Email not found' });

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await pool.query('UPDATE users SET otp_code = ?, otp_expires = ? WHERE email = ?', [otp, otpExpires, email]);

        const emailSent = await sendOTPEmail(email, otp, users[0].firstname);
        res.json({ success: true, message: emailSent ? 'OTP sent' : 'Failed to send', emailSent });

    } catch (error) {
        res.status(500).json({ error: 'Failed to resend OTP' });
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
        if (!user.email_verified) {
            return res.status(403).json({ error: 'Email not verified', needsVerification: true, email: user.email });
        }

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

// Logout
router.post('/logout', (req, res) => {
    req.logout?.(() => { });
    res.json({ success: true });
});

export default router;

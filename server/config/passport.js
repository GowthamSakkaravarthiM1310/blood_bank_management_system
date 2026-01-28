import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists
            const existingUsers = await query(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [profile.id, profile.emails[0].value]
            );

            if (existingUsers.length > 0) {
                // Update existing user with Google info if needed
                const user = existingUsers[0];
                if (!user.google_id) {
                    await query(
                        'UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?',
                        [profile.id, profile.photos[0]?.value, user.id]
                    );
                }
                return done(null, user);
            }

            // Create new user
            const result = await query(
                `INSERT INTO users (email, name, google_id, avatar_url, role) 
         VALUES (?, ?, ?, ?, 'donor')`,
                [
                    profile.emails[0].value,
                    profile.displayName,
                    profile.id,
                    profile.photos[0]?.value
                ]
            );

            const newUser = {
                id: result.insertId,
                email: profile.emails[0].value,
                name: profile.displayName,
                google_id: profile.id,
                avatar_url: profile.photos[0]?.value,
                role: 'donor'
            };

            return done(null, newUser);
        } catch (error) {
            console.error('Google OAuth Error:', error);
            return done(error, null);
        }
    }
));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]);
        done(null, users[0] || null);
    } catch (error) {
        done(error, null);
    }
});

export default passport;

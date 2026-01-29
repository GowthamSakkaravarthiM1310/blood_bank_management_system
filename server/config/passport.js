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
            const email = profile.emails[0].value;
            const avatarUrl = profile.photos[0]?.value || null;
            const displayName = profile.displayName || '';
            const firstName = profile.name?.givenName || displayName.split(' ')[0] || '';
            const lastName = profile.name?.familyName || displayName.split(' ').slice(1).join(' ') || '';

            // Check if user exists
            const existingUsers = await query(
                'SELECT * FROM users WHERE google_id = ? OR email = ?',
                [profile.id, email]
            );

            if (existingUsers.length > 0) {
                // Update existing user with Google info if needed
                const user = existingUsers[0];
                if (!user.google_id || !user.avatar_url) {
                    await query(
                        'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?), email_verified = TRUE WHERE id = ?',
                        [profile.id, avatarUrl, user.id]
                    );
                    user.google_id = profile.id;
                    user.avatar_url = user.avatar_url || avatarUrl;
                    user.email_verified = true;
                }
                return done(null, user);
            }

            // Create new user with Google profile data
            const result = await query(
                `INSERT INTO users (email, name, firstname, lastname, google_id, avatar_url, email_verified, role) 
         VALUES (?, ?, ?, ?, ?, ?, TRUE, 'user')`,
                [email, displayName, firstName, lastName, profile.id, avatarUrl]
            );

            const newUser = {
                id: result.insertId,
                email: email,
                name: displayName,
                firstname: firstName,
                lastname: lastName,
                google_id: profile.id,
                avatar_url: avatarUrl,
                email_verified: true,
                role: 'user'
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

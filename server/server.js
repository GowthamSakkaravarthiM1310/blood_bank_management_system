import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import passport from 'passport';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import requestRoutes from './routes/requests.js';
import bankRoutes from './routes/banks.js';
import adminRoutes from './routes/admin.js';
import locationRoutes from './routes/locations.js';
import uploadRoutes from './routes/upload.js';
import bloodBankUserRoutes from './routes/bloodBankUser.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import database
import { testConnection } from './config/db.js';

// Import passport config
import './config/passport.js';

// Import socket setup
import { setupSocket } from './socket/index.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Session configuration for Passport OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'blood-bank-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/blood-bank-user', bloodBankUserRoutes);

// Error handling middleware
app.use(errorHandler);

// Setup Socket.IO
setupSocket(io);

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();
        console.log('✅ Database connected successfully');

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.IO ready`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.log('⚠️  Server starting without database connection...');

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (database not connected)`);
        });
    }
};

startServer();

export { io };

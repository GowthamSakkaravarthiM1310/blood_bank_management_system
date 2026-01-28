// Socket.IO setup for real-time features
export const setupSocket = (io) => {
    // Track connected users
    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);

        // Handle user authentication
        socket.on('authenticate', (userId) => {
            connectedUsers.set(socket.id, userId);
            socket.userId = userId;

            // Join user-specific room
            socket.join(`user:${userId}`);

            // Broadcast updated online count
            io.emit('stats:update', {
                donorsOnline: connectedUsers.size
            });
        });

        // Handle joining specific rooms (e.g., blood type rooms for notifications)
        socket.on('subscribe:bloodType', (bloodType) => {
            socket.join(`bloodType:${bloodType}`);
            console.log(`Socket ${socket.id} subscribed to ${bloodType}`);
        });

        // Handle request for live stats
        socket.on('stats:request', () => {
            socket.emit('stats:update', {
                donorsOnline: connectedUsers.size,
                requestsActive: getActiveRequestsCount(),
                timestamp: new Date().toISOString()
            });
        });

        // Handle chat/messaging (optional feature)
        socket.on('message:send', (data) => {
            const { recipientId, message } = data;
            io.to(`user:${recipientId}`).emit('message:received', {
                senderId: socket.userId,
                message,
                timestamp: new Date().toISOString()
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.id);
            console.log(`🔌 Client disconnected: ${socket.id}`);

            // Broadcast updated online count
            io.emit('stats:update', {
                donorsOnline: connectedUsers.size
            });
        });
    });

    // Simulated live stats updates (similar to existing RealtimeContext)
    setInterval(() => {
        const stats = {
            donorsOnline: Math.max(100, connectedUsers.size + Math.floor(Math.random() * 50)),
            requestsActive: Math.floor(Math.random() * 50) + 20,
            livesSaved: 1243 + Math.floor(Math.random() * 10),
            timestamp: new Date().toISOString()
        };
        io.emit('stats:update', stats);
    }, 5000);
};

// Helper function to track active requests (would be replaced with DB query)
let activeRequestsCount = 45;
const getActiveRequestsCount = () => {
    activeRequestsCount = Math.max(20, activeRequestsCount + Math.floor(Math.random() * 3) - 1);
    return activeRequestsCount;
};

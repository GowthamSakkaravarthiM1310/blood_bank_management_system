import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

// Socket.IO server URL
const SOCKET_URL = 'http://localhost:3001';

export const RealtimeProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [liveStats, setLiveStats] = useState({
        donorsOnline: 124,
        requestsActive: 45,
        livesSaved: 1243,
    });

    // Initialize socket connection
    useEffect(() => {
        const socketInstance = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socketInstance.on('connect', () => {
            console.log('🔌 Connected to real-time server');
            setIsConnected(true);

            // Authenticate if user is logged in
            const token = localStorage.getItem('token');
            if (token) {
                // Decode token to get user ID (simple decode, not verification)
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    socketInstance.emit('authenticate', payload.userId);
                } catch (e) {
                    console.error('Failed to parse token');
                }
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 Disconnected from real-time server');
            setIsConnected(false);
        });

        // Handle live stats updates
        socketInstance.on('stats:update', (stats) => {
            setLiveStats(prev => ({
                ...prev,
                ...stats
            }));
        });

        // Handle new blood requests
        socketInstance.on('request:created', (request) => {
            if (request.urgency === 'urgent' || request.urgency === 'critical') {
                toast((t) => (
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-sm">
                            {request.blood_type}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">New Urgent Request</p>
                            <p className="text-sm text-gray-500">{request.hospital}</p>
                        </div>
                    </div>
                ), {
                    duration: 5000,
                    position: 'bottom-right',
                    style: {
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }
                });
            }
        });

        // Handle notifications
        socketInstance.on('notification', (notification) => {
            toast((t) => (
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                        !
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{notification.type === 'low_stock' ? 'Low Stock Alert' : 'New Request'}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                    </div>
                </div>
            ), {
                duration: 4000,
                position: 'bottom-right',
                style: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }
            });
        });

        // Handle inventory updates
        socketInstance.on('inventory:updated', (data) => {
            console.log('Inventory updated:', data);
            // Components can subscribe to this event for real-time updates
        });

        // Handle donor updates
        socketInstance.on('donor:created', (donor) => {
            toast.success(`New donor registered: ${donor.name}`);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Fallback: Simulate live stats if not connected to server
    useEffect(() => {
        if (isConnected) return; // Don't simulate if connected to real server

        const interval = setInterval(() => {
            setLiveStats(prev => ({
                ...prev,
                donorsOnline: Math.max(100, prev.donorsOnline + Math.floor(Math.random() * 5) - 2),
                requestsActive: Math.max(20, prev.requestsActive + Math.floor(Math.random() * 3) - 1),
                livesSaved: prev.livesSaved + (Math.random() > 0.8 ? 1 : 0),
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [isConnected]);

    // Fallback: Simulate random incoming requests if not connected
    useEffect(() => {
        if (isConnected) return;

        const bloodTypes = ['A+', 'O+', 'B-', 'AB+', 'O-', 'A-'];
        const locations = ['City Hospital', 'Memorial Medical', 'Central Clinic', 'St. Marys'];

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                const shouldTrigger = Math.random() > 0.6;
                if (shouldTrigger) {
                    const type = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
                    const loc = locations[Math.floor(Math.random() * locations.length)];

                    toast((t) => (
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold">
                                {type}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">New Request</p>
                                <p className="text-sm text-gray-500">Urgent need at {loc}</p>
                            </div>
                        </div>
                    ), {
                        duration: 4000,
                        position: 'bottom-right',
                        style: {
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }
                    });
                }
            }, 12000);
            return () => clearInterval(interval);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [isConnected]);

    // Subscribe to blood type notifications
    const subscribeToBloodType = useCallback((bloodType) => {
        if (socket) {
            socket.emit('subscribe:bloodType', bloodType);
        }
    }, [socket]);

    // Request updated stats
    const requestStats = useCallback(() => {
        if (socket) {
            socket.emit('stats:request');
        }
    }, [socket]);

    return (
        <RealtimeContext.Provider value={{
            liveStats,
            isConnected,
            socket,
            subscribeToBloodType,
            requestStats
        }}>
            {children}
            <Toaster />
        </RealtimeContext.Provider>
    );
};

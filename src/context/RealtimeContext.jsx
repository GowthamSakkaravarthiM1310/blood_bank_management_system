import React, { createContext, useContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
    const [liveStats, setLiveStats] = useState({
        donorsOnline: 124,
        requestsActive: 45,
        livesSaved: 1243,
    });

    // Simulate live stats updates
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                ...prev,
                donorsOnline: Math.max(100, prev.donorsOnline + Math.floor(Math.random() * 5) - 2),
                requestsActive: Math.max(20, prev.requestsActive + Math.floor(Math.random() * 3) - 1),
                livesSaved: prev.livesSaved + (Math.random() > 0.8 ? 1 : 0), // Occasional increment
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Simulate random incoming requests
    useEffect(() => {
        const bloodTypes = ['A+', 'O+', 'B-', 'AB+', 'O-', 'A-'];
        const locations = ['City Hospital', 'Memorial Medical', 'Central Clinic', 'St. Marys'];

        // Initial delay then start loop
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
    }, []);

    return (
        <RealtimeContext.Provider value={{ liveStats }}>
            {children}
            <Toaster />
        </RealtimeContext.Provider>
    );
};

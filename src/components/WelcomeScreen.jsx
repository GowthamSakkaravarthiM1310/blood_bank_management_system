import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, User, Heart, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen = ({ onEnter, onLogout }) => {
    const [cells, setCells] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const initialCells = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: 20 + Math.random() * 100,
            duration: 15 + Math.random() * 20,
            delay: Math.random() * -20,
            blur: Math.random() > 0.5 ? 2 : 0, // Depth of field simulation
        }));
        setCells(initialCells);
    }, []);

    const handleNavigation = (path) => {
        onEnter(); // Dismiss welcome screen
        navigate(path);
    };

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col font-sans"
        >
            {/* 3D Blood Cell Background */}
            {cells.map((cell) => (
                <div
                    key={cell.id}
                    className="blood-cell absolute pointer-events-none"
                    style={{
                        left: cell.left,
                        width: `${cell.size}px`,
                        height: `${cell.size}px`,
                        animationDuration: `${cell.duration}s`,
                        animationDelay: `${cell.delay}s`,
                        filter: `blur(${cell.blur}px)`, // 3D Depth effect
                        boxShadow: `inset -${cell.size / 5}px -${cell.size / 5}px ${cell.size / 3}px rgba(0,0,0,0.5), ${cell.size / 10}px ${cell.size / 10}px ${cell.size / 3}px rgba(255,50,50,0.3)` // Enhanced 3D shading
                    }}
                />
            ))}

            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none"></div>

            {/* Top Navbar */}
            <nav className="relative z-20 flex justify-between items-center px-8 py-6 w-full text-white/90">
                <div className="text-xl font-bold tracking-wider flex items-center gap-2">
                    <Droplet className="h-6 w-6 text-red-600 fill-red-600" />
                    <span>Blood Bank</span>
                </div>
                <div className="space-x-6 font-medium text-sm tracking-wide">
                    <span className="hover:text-red-500 cursor-pointer transition" onClick={() => window.location.reload()}>Home</span>
                    {onLogout ? (
                        <span
                            className="hover:text-red-500 cursor-pointer transition flex items-center gap-2"
                            onClick={onLogout}
                        >
                            Logout
                        </span>
                    ) : (
                        <span className="hover:text-red-500 cursor-pointer transition">Login</span>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-16 text-center drop-shadow-2xl"
                >
                    Blood Bank Management System
                </motion.h1>

                <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-center">
                    {/* Button 1: Blood Donor */}
                    <CardButton
                        title="Blood Donor"
                        icon={User}
                        delay={0.4}
                        onClick={() => handleNavigation('/donor')}
                    />

                    {/* Button 2: Blood Request */}
                    <CardButton
                        title="Blood Request"
                        icon={Heart}
                        delay={0.6}
                        onClick={() => handleNavigation('/request')}
                    />

                    {/* Button 3: Blood Bank */}
                    <CardButton
                        title="Blood Bank"
                        icon={Database}
                        delay={0.8}
                        onClick={() => handleNavigation('/bank')}
                    />
                </div>
            </div>

            <div className="relative z-20 pb-4 text-center text-white/20 text-xs">
                &copy; 2026 LifeFlow Systems
            </div>
        </motion.div>
    );
};

// Reusable 3D Button Card Component
const CardButton = ({ title, icon: Icon, delay, onClick }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.05, translateY: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="group relative w-64 h-40 bg-gradient-to-br from-red-800 to-red-950 rounded-2xl flex flex-col items-center justify-center border border-red-700/50 shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all overflow-hidden"
    >
        <div className="absolute inset-0 bg-red-600/20 group-hover:bg-red-600/30 transition-colors"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>

        <Icon className="h-10 w-10 text-white mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <span className="text-xl font-bold text-white tracking-wide group-hover:text-red-100 transition-colors">{title}</span>
    </motion.button>
);

export default WelcomeScreen;

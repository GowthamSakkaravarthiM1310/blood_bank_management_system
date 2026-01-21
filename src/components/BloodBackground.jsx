import React, { useEffect, useState } from 'react';

const BloodBackground = ({ intensity = 'normal' }) => {
    const [cells, setCells] = useState([]);

    useEffect(() => {
        const count = intensity === 'low' ? 10 : 20;
        const initialCells = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            size: 10 + Math.random() * 60, // Slightly smaller than welcome screen
            duration: 20 + Math.random() * 20,
            delay: Math.random() * -20,
            blur: Math.random() > 0.5 ? 2 : 0,
            opacity: Math.random() * 0.5 + 0.1, // Subtle opacity
        }));
        setCells(initialCells);
    }, [intensity]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-rose-50/50"></div>

            {/* Floating Cells */}
            {cells.map((cell) => (
                <div
                    key={cell.id}
                    className="blood-cell absolute"
                    style={{
                        left: cell.left,
                        width: `${cell.size}px`,
                        height: `${cell.size}px`,
                        animationDuration: `${cell.duration}s`,
                        animationDelay: `${cell.delay}s`,
                        filter: `blur(${cell.blur}px)`,
                        opacity: cell.opacity,
                        // We use the global .blood-cell class styles for shape/color
                    }}
                />
            ))}

            {/* Overlay for readability if needed */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
        </div>
    );
};

export default BloodBackground;

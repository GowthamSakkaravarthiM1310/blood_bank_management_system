import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const FrontPage = ({ onLogin }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden px-4 sm:px-6 lg:px-8">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md flex flex-col items-center"
            >
                {/* Optional Title for larger screens */}
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="hidden sm:block text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-center tracking-wide"
                >
                    Blood Bank Management
                </motion.h1>

                <button
                    onClick={onLogin}
                    className="group relative w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-transparent border-2 border-red-600 text-red-500 font-bold text-base sm:text-lg md:text-xl tracking-widest uppercase rounded-full overflow-hidden transition-all hover:text-white hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] active:scale-95 touch-manipulation"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                        SaveLifes <LogIn className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    </span>
                    <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-0"></div>
                </button>

                {/* Mobile-friendly subtitle */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-4 sm:mt-6 text-gray-500 text-xs sm:text-sm text-center"
                >
                    Donate blood, save lives
                </motion.p>
            </motion.div>
        </div>
    );
};

export default FrontPage;

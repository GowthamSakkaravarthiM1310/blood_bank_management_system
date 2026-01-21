import React from 'react';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

const FrontPage = ({ onLogin }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent opacity-50"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
            >
                <button
                    onClick={onLogin}
                    className="group relative px-8 py-4 bg-transparent border border-red-600 text-red-500 font-bold text-xl tracking-widest uppercase rounded-full overflow-hidden transition-all hover:text-white hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                >
                    <span className="relative z-10 flex items-center gap-3">
                        SaveLifes <LogIn className="w-5 h-5" />
                    </span>
                    <div className="absolute inset-0 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out -z-0"></div>
                </button>
            </motion.div>
        </div>
    );
};

export default FrontPage;

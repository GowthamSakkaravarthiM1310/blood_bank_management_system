import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, CheckCircle2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            // Handle error
            console.error('OAuth Error:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            // Store token
            localStorage.setItem('token', token);

            // Redirect to home after a brief delay to show success
            setTimeout(() => {
                navigate('/');
                // Force page reload to update auth state
                window.location.reload();
            }, 1500);
        } else {
            // No token, redirect to login
            navigate('/login');
        }
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h1>
                <p className="text-gray-600 mb-4">Redirecting you to the dashboard...</p>

                <div className="flex items-center justify-center gap-2">
                    <Droplet className="w-5 h-5 text-rose-600 animate-bounce" />
                    <span className="text-sm text-gray-500">Please wait...</span>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthCallback;

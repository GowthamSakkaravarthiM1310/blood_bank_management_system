import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, ArrowRight, User, Lock, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ onConnect }) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'donor'; // 'donor' or 'request' or default
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    const promise = new Promise((resolve) => setTimeout(resolve, 1500));

    toast.promise(promise, {
      loading: 'Authenticating...',
      success: 'Welcome back!',
      error: 'Error',
    }).then(() => {
      if (onConnect) onConnect(); // Use the prop to update parent state
      navigate('/'); // Navigate to home/dashboard
    });
  };

  return (
    <div className="min-h-screen pt-20 flex bg-slate-50">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 w-full lg:w-[480px]">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <Droplet className="h-12 w-12 text-rose-600 mx-auto lg:mx-0" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Join the network'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-rose-600 hover:text-rose-500 transition-colors">
                {isLogin ? 'create a new account' : 'sign in instead'}
              </button>
            </p>
          </motion.div>

          <div className="mt-8">
            <div className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-shadow"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-rose-500 focus:border-rose-500 sm:text-sm transition-shadow"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-rose-600 hover:text-rose-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all hover:scale-[1.02] shadow-rose-500/30"
                  >
                    {isLogin ? 'Sign in' : 'Register'} <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Banner */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-rose-500 to-purple-600">
          <div className="absolute inset-0 bg-pattern opacity-10"></div> {/* Optional pattern */}
          <div className="flex flex-col h-full items-center justify-center text-white px-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Heart className="h-32 w-32 fill-white/20 text-white mb-8 mx-auto" />
              <h2 className="text-4xl font-bold mb-4">Every Drop Counts</h2>
              <p className="text-lg text-rose-100 max-w-lg">
                Join our community of heroes. Whether you are donating or requesting, we make the process seamless and fast.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

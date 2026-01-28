import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Droplet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Try to get user from AuthContext
  let authUser = null;
  try {
    const auth = useAuth();
    authUser = auth?.user;
  } catch (e) {
    // AuthContext not available
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Donate Blood', path: '/donor' },
    { name: 'Request Blood', path: '/request' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  // Get user initials or first letter
  const getUserInitial = () => {
    if (authUser?.name) {
      return authUser.name.charAt(0).toUpperCase();
    }
    if (authUser?.email) {
      return authUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-gray-200/50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            <div className="relative">
              <Droplet className="h-8 w-8 text-rose-600 group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
              <div className="absolute inset-0 bg-rose-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            </div>
            <span className="self-center text-2xl font-bold whitespace-nowrap text-gray-900 tracking-tight">
              Life<span className="text-rose-600">Flow</span>
            </span>
          </Link>

          <button
            onClick={toggleMenu}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-default"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-transparent items-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`block py-2 px-3 rounded md:p-0 transition-colors duration-200 ${isActive(link.path)
                      ? 'text-rose-600 font-semibold'
                      : 'text-gray-900 hover:text-rose-600'
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {/* Profile Avatar */}
              <li>
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 group ${isActive('/profile') ? 'ring-2 ring-rose-500 ring-offset-2 rounded-full' : ''}`}
                  title={authUser?.email || 'Profile'}
                >
                  {authUser?.avatar_url ? (
                    <img
                      src={authUser.avatar_url}
                      alt={authUser.name || 'Profile'}
                      className="w-10 h-10 rounded-full border-2 border-rose-200 hover:border-rose-400 transition-colors object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold text-sm border-2 border-rose-200 hover:border-rose-400 transition-colors shadow-md">
                      {getUserInitial()}
                    </div>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <ul className="flex flex-col p-4 space-y-4 font-medium text-center">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-2 px-3 rounded transition-colors duration-200 ${isActive(link.path)
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-gray-900 hover:bg-gray-50 hover:text-rose-600'
                      }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {/* Mobile Profile Link */}
              <li>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-3 py-3 px-4 bg-rose-50 rounded-xl text-rose-600 font-medium"
                >
                  {authUser?.avatar_url ? (
                    <img
                      src={authUser.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold text-xs">
                      {getUserInitial()}
                    </div>
                  )}
                  <span>{authUser?.name || 'My Profile'}</span>
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

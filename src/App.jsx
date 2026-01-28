
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import BloodDonor from './pages/BloodDonor'
import BloodRequest from './pages/BloodRequest'
import BloodBank from './pages/BloodBank'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { AnimatePresence } from 'framer-motion'

import FrontPage from './components/FrontPage'
import UserProfile from './pages/UserProfile'
import AuthCallback from './pages/AuthCallback'

import { AuthProvider, useAuth } from './context/AuthContext'
import { RealtimeProvider } from './context/RealtimeContext'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Main App Content (needs to be inside AuthProvider to use useAuth)
const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginFlow, setShowLoginFlow] = useState(false);

  // Try to use AuthContext
  let auth = null;
  try {
    auth = useAuth();
  } catch (e) {
    // AuthContext not available, use local state
  }

  // Check for token in URL (OAuth callback) or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoggedIn(true);
    } else if (localStorage.getItem('token')) {
      setIsLoggedIn(true);
    }
  }, []);

  // Sync with AuthContext if available
  useEffect(() => {
    if (auth?.isAuthenticated !== undefined) {
      setIsLoggedIn(auth.isAuthenticated);
    }
  }, [auth?.isAuthenticated]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
    } else {
      localStorage.removeItem('token');
    }
    setIsLoggedIn(false);
    setShowLoginFlow(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Admin Routes (always accessible) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Auth Flow */}
        {!isLoggedIn && (
          <>
            <Route
              path="/"
              element={
                !showLoginFlow ? (
                  <FrontPage onLogin={() => setShowLoginFlow(true)} />
                ) : (
                  <Login onConnect={handleLogin} />
                )
              }
            />
            <Route path="/login" element={<Login onConnect={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* Main Application Routes */}
        {isLoggedIn && (
          <>
            <Route
              path="/*"
              element={
                <>
                  <Navbar onLogout={handleLogout} />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/register" element={<Navigate to="/" replace />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/donor" element={<BloodDonor />} />
                    <Route path="/request" element={<BloodRequest />} />
                    <Route path="/bank" element={<BloodBank />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </>
              }
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <AppContent />
      </RealtimeProvider>
    </AuthProvider>
  );
}

export default App

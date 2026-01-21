
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BloodDonor from './pages/BloodDonor'
import BloodRequest from './pages/BloodRequest'
import BloodBank from './pages/BloodBank'
import WelcomeScreen from './components/WelcomeScreen'
import { AnimatePresence } from 'framer-motion'

import FrontPage from './components/FrontPage'
import UserProfile from './pages/UserProfile'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginFlow, setShowLoginFlow] = useState(false);

  return (
    <BrowserRouter>
      {/* Auth Flow */}
      {!isLoggedIn && (
        <>
          {!showLoginFlow ? (
            <FrontPage onLogin={() => setShowLoginFlow(true)} />
          ) : (
            <Login onConnect={() => setIsLoggedIn(true)} />
          )}
        </>
      )}

      {/* Main Application */}
      {isLoggedIn && (
        <>
          <Navbar
            onLogout={() => {
              setIsLoggedIn(false);
              setShowLoginFlow(false);
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onConnect={() => setIsLoggedIn(true)} />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/donor" element={<BloodDonor />} />
            <Route path="/request" element={<BloodRequest />} />
            <Route path="/bank" element={<BloodBank />} />
          </Routes>
        </>
      )}
    </BrowserRouter>
  )
}

export default App

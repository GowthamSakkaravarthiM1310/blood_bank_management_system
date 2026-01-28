import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Heart, Database, Settings, Menu, X, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BloodDonor from './BloodDonor';
import BloodBank from './BloodBank';
import BloodRequest from './BloodRequest';
import Contact from './Contact';
import About from './About';

import { donorsAPI, requestsAPI, banksAPI } from '../services/api';
import { useEffect } from 'react';

// Dashboard Overview Component with Real Data
const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    pendingRequests: 0,
    totalUnits: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donorsRes, requestsRes, banksRes] = await Promise.all([
          donorsAPI.getAll(),
          requestsAPI.getAll(),
          banksAPI.getAll()
        ]);

        const donors = donorsRes.donors || [];
        const requests = requestsRes.requests || [];
        const banks = banksRes.banks || [];

        // Calculate total blood units
        let units = 0;
        banks.forEach(bank => {
          if (bank.inventory && Array.isArray(bank.inventory)) {
            bank.inventory.forEach(item => units += item.units || 0);
          }
        });

        setStats({
          totalDonors: donors.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          totalUnits: units
        });

        // Recent activity from requests
        setRecentActivity(requests.slice(0, 5));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-10 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-600 mx-auto"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Total Donors</h3>
            <Users className="text-rose-500 bg-rose-50 p-2 rounded-lg h-8 w-8" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalDonors}</p>
          <p className="text-sm text-gray-500 mt-2">Registered donors</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Pending Requests</h3>
            <Heart className="text-rose-500 bg-rose-50 p-2 rounded-lg h-8 w-8" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
          <p className="text-sm text-rose-500 mt-2">Needs attention</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-600">Blood Units</h3>
            <Database className="text-blue-500 bg-blue-50 p-2 rounded-lg h-8 w-8" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUnits}</p>
          <p className="text-sm text-gray-500 mt-2">Available across all banks</p>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-800">Recent Requests</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">No recent activity</p>
          ) : (
            recentActivity.map((request) => (
              <div key={request.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold">
                    {request.requester_name ? request.requester_name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.requester_name || 'User'} requested <span className="font-bold">{request.blood_type}</span> Blood
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()} at {new Date(request.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                  }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const menuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Donors', path: '/dashboard/donor', icon: Users },
    { name: 'Blood Bank', path: '/dashboard/bank', icon: Database },
    { name: 'Requests', path: '/dashboard/request', icon: Heart },
    { name: 'About', path: '/dashboard/about', icon: Settings }, // Using Settings icon for About/Settings
  ];

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex pt-20"> {/* pt-20 to account for the Main Navbar if visible, or remove if standalone */}
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out pt-20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-6 px-4">
            <h2 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Main Menu</h2>
          </div>
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg group transition-colors ${isActive(item.path)
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className={`w-5 h-5 transition duration-75 ${isActive(item.path) ? 'text-rose-600' : 'text-gray-500 group-hover:text-gray-900'}`} />
                  <span className="ms-3">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-gray-100 px-4">
            <button className="flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group">
              <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition" />
              <span className="ms-3 group-hover:text-red-600 transition">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Sidebar Toggle + Title) */}
        <div className="lg:hidden p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <button onClick={toggleSidebar} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-gray-900">Dashboard</span>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route path="/" element={<DashboardOverview />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="donor" element={<BloodDonor />} />
                <Route path="bank" element={<BloodBank />} />
                <Route path="request" element={<BloodRequest />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

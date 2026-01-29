import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Droplet, MapPin, Phone, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import BloodBackground from '../components/BloodBackground';
import { banksAPI } from '../services/api';

function BloodBank() {
  const [searchTerm, setSearchTerm] = useState('');
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banks on mount
  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      const response = await banksAPI.getAll();
      setBanks(response.banks || []);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      // No fallback data - only show real banks
      setBanks([]);
      toast.error('Failed to load blood banks');
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full p-6 md:p-12 overflow-x-hidden">
      <BloodBackground intensity="low" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <Database className="w-8 h-8 text-rose-600" />
              Blood Stock Status
            </h1>
            <p className="text-gray-500 text-lg">Real-time availability across our network.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBanks}
              className="p-3 rounded-full hover:bg-white/50 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              <input
                placeholder="Search blood banks or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-rose-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading blood banks...</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {filteredBanks.map((bank, index) => (
              <motion.div
                key={bank.id || index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] group"
              >
                <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-rose-700 transition-colors">{bank.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {bank.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {bank.hours}</span>
                    </div>
                  </div>
                  <button className="p-3 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <BloodTypeStat type="A" count={bank.A || 0} />
                  <BloodTypeStat type="B" count={bank.B || 0} />
                  <BloodTypeStat type="O" count={bank.O || 0} />
                  <BloodTypeStat type="AB" count={bank.AB || 0} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredBanks.length === 0 && (
          <div className="text-center py-20">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No blood banks found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Sub-component for individual blood type stats
const BloodTypeStat = ({ type, count }) => {
  const isLow = count < 5;
  return (
    <div className={`rounded-2xl p-4 text-center border ${isLow ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'} transition-all`}>
      <div className="text-sm font-semibold text-gray-500 mb-1">Type {type}</div>
      <div className={`text-2xl font-black ${isLow ? 'text-red-600' : 'text-emerald-600'} flex items-center justify-center gap-1`}>
        <Droplet className={`w-4 h-4 ${isLow ? 'fill-red-600' : 'fill-emerald-600'}`} />
        {count}
      </div>
      <div className="text-xs text-gray-400 mt-1">Units</div>
    </div>
  )
}

export default BloodBank

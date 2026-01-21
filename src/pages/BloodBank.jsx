import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Droplet, MapPin, Phone, Clock } from 'lucide-react';
import BloodBackground from '../components/BloodBackground';

function BloodBank() {
  const [searchTerm, setSearchTerm] = useState('');

  const banks = [
    { name: 'Central City Branch', location: 'Downtown, 5th Ave', phone: '555-0101', hours: '24/7', A: 12, B: 8, O: 18, AB: 4 },
    { name: 'Northside Clinic', location: 'North Hills, Block C', phone: '555-0202', hours: '8am - 10pm', A: 6, B: 15, O: 9, AB: 2 },
    { name: 'South General Hospital', location: 'South Gate, Ring Rd', phone: '555-0303', hours: '24/7', A: 14, B: 5, O: 7, AB: 8 },
    { name: 'West End Center', location: 'West End, Mall Plaza', phone: '555-0404', hours: '9am - 5pm', A: 9, B: 11, O: 13, AB: 5 }
  ];

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

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          {filteredBanks.map((bank, index) => (
            <motion.div
              key={index}
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
                <BloodTypeStat type="A" count={bank.A} />
                <BloodTypeStat type="B" count={bank.B} />
                <BloodTypeStat type="O" count={bank.O} />
                <BloodTypeStat type="AB" count={bank.AB} />
              </div>
            </motion.div>
          ))}
        </div>
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

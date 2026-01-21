import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import BloodBackground from '../components/BloodBackground';
import toast from 'react-hot-toast';

function BloodRequest() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      toast.success('Urgent Request Broadcasted!');
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <BloodBackground intensity="normal" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-12"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <Heart className="w-10 h-10 text-rose-600 fill-rose-600 animate-pulse" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Request Blood</h1>
          <p className="text-gray-500 text-lg">Send an urgent alert to nearby donors immediately.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Patient Name</label>
                <div className="relative">
                  <input required placeholder="John Doe" className="w-full px-5 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Blood Type Needed</label>
                <select className="w-full px-5 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none appearance-none">
                  <option>Select Type</option>
                  <option>A+</option> <option>A-</option>
                  <option>B+</option> <option>B-</option>
                  <option>O+</option> <option>O-</option>
                  <option>AB+</option> <option>AB-</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Hospital / Location</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                <input required placeholder="City Hospital, Ward 3" className="w-full pl-12 pr-5 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Urgency Note</label>
              <div className="relative">
                <textarea required rows="3" placeholder="Critical condition, open heart surgery..." className="w-full px-5 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none resize-none" />
              </div>
            </div>

            <div className="pt-4">
              <button className="w-full btn-premium flex items-center justify-center gap-3 text-lg group">
                <span>Broadcast Request</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm border border-amber-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>This request will be sent to all registered donors within a 50km radius. Please verify details before sending.</p>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h3>
            <p className="text-gray-500 mb-8">We have notified 142 donors in your area. You will receive updates shortly.</p>
            <button onClick={() => setSubmitted(false)} className="text-rose-600 font-semibold hover:text-rose-700 hover:underline">
              Send Another Request
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default BloodRequest

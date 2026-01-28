import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, User, Phone, FileText, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import BloodBackground from '../components/BloodBackground';
import { donorsAPI } from '../services/api';

function BloodDonor() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', group: '', phone: '', email: '' });
  const [submitting, setSubmitting] = useState(false);

  // Fetch donors on mount
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await donorsAPI.getAll();
      setDonors(response.donors || []);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
      // Fallback to mock data if API fails
      setDonors([
        { id: '1', name: 'John Doe', blood_group: 'A+', phone: '555-0123' },
        { id: '2', name: 'Jane Smith', blood_group: 'O-', phone: '555-0198' },
      ]);
      toast.error('Using offline data - API unavailable');
    } finally {
      setLoading(false);
    }
  };

  const addDonor = async (e) => {
    e.preventDefault();
    if (!form.name || !form.group) {
      toast.error('Name and blood group are required');
      return;
    }

    setSubmitting(true);
    try {
      const response = await donorsAPI.create({
        name: form.name,
        bloodGroup: form.group,
        phone: form.phone,
        email: form.email
      });
      setDonors([response.donor, ...donors]);
      setForm({ name: '', group: '', phone: '', email: '' });
      toast.success('Donor registered successfully!');
    } catch (error) {
      console.error('Failed to add donor:', error);
      // Fallback: add locally
      const newDonor = {
        id: Date.now().toString(),
        name: form.name,
        blood_group: form.group,
        phone: form.phone
      };
      setDonors([newDonor, ...donors]);
      setForm({ name: '', group: '', phone: '', email: '' });
      toast.success('Donor added (offline mode)');
    } finally {
      setSubmitting(false);
    }
  };

  const removeDonor = async (id) => {
    try {
      await donorsAPI.delete(id);
      setDonors(donors.filter(d => d.id !== id));
      toast.success('Donor removed');
    } catch (error) {
      console.error('Failed to remove donor:', error);
      // Fallback: remove locally
      setDonors(donors.filter(d => d.id !== id));
      toast.success('Donor removed (offline mode)');
    }
  };

  return (
    <div className="relative min-h-screen w-full p-6 md:p-12">
      <BloodBackground intensity="low" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Donor Management</h2>
          <div className="flex gap-2">
            <button
              onClick={fetchDonors}
              className="p-2.5 rounded-full hover:bg-gray-100 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="bg-rose-600 text-white px-5 py-2.5 rounded-full hover:bg-rose-700 transition flex items-center gap-2 shadow-lg hover:shadow-rose-500/30 transform hover:scale-105 active:scale-95 duration-200">
              <Plus className="w-5 h-5" /> Add New Donor
            </button>
          </div>
        </div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-100 rounded-lg">
              <User className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Register New Donor</h3>
          </div>

          <form onSubmit={addDonor} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative group">
              <User className="absolute left-4 top-3 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              <input
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="relative group">
              <FileText className="absolute left-4 top-3 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition appearance-none"
                value={form.group}
                onChange={e => setForm({ ...form, group: e.target.value })}
              >
                <option value="">Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="relative group">
              <Phone className="absolute left-4 top-3 h-5 w-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              <input
                placeholder="Phone Number"
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition font-medium shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Donor'}
            </button>
          </form>
        </motion.div>

        {/* List Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-200/50">
                <tr>
                  <th className="px-8 py-5 font-bold text-gray-600 text-sm uppercase tracking-wider">ID</th>
                  <th className="px-8 py-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Name</th>
                  <th className="px-8 py-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Blood Group</th>
                  <th className="px-8 py-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                  <th className="px-8 py-5 font-bold text-gray-600 text-sm uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin opacity-50" />
                        <p>Loading donors...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {donors.map((d) => (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        className="hover:bg-rose-50/30 transition-colors group"
                      >
                        <td className="px-8 py-5 text-gray-500 font-mono text-sm">#{d.id}</td>
                        <td className="px-8 py-5 font-semibold text-gray-900">{d.name}</td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            {d.blood_group || d.group}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-gray-500">{d.phone}</td>
                        <td className="px-8 py-5">
                          <button
                            onClick={() => removeDonor(d.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
                {!loading && donors.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <User className="w-12 h-12 opacity-20" />
                        <p>No donors found. Add one above.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default BloodDonor;

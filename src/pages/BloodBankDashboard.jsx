import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Droplet, Plus, Minus, Save, RefreshCw, Clock, MapPin, Phone, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

const BloodBankDashboard = () => {
    const { user } = useAuth();
    const { socket } = useRealtime();
    const [bank, setBank] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [editingBank, setEditingBank] = useState(false);
    const [bankForm, setBankForm] = useState({ name: '', location: '', phone: '', hours: '' });

    const token = localStorage.getItem('token');

    // Fetch bank data on mount
    useEffect(() => {
        fetchBankData();
        fetchRequests();
    }, []);

    // Listen for real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('inventory:updated', (data) => {
                if (data.bankId === bank?.id) {
                    setInventory(data.inventory);
                    toast.success('Inventory updated!');
                }
            });

            socket.on('request:created', (data) => {
                setRequests(prev => [data, ...prev]);
                toast('New blood request received!', { icon: '🩸' });
            });

            return () => {
                socket.off('inventory:updated');
                socket.off('request:created');
            };
        }
    }, [socket, bank]);

    const fetchBankData = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3001/api/blood-bank-user/bank', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setBank(data.bank);
                setInventory(data.inventory || []);
                setBankForm({
                    name: data.bank.name || '',
                    location: data.bank.location || '',
                    phone: data.bank.phone || '',
                    hours: data.bank.hours || ''
                });
            } else {
                toast.error('Failed to fetch bank data');
            }
        } catch (error) {
            console.error('Error fetching bank:', error);
            toast.error('Failed to load bank data');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/blood-bank-user/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setRequests(data.requests || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const updateInventory = async (bloodType, action, amount = 1) => {
        setUpdating(bloodType);
        try {
            const res = await fetch('http://localhost:3001/api/blood-bank-user/inventory', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bloodType, action, units: amount })
            });

            if (res.ok) {
                const data = await res.json();
                setInventory(data.inventory);
                toast.success(`${bloodType} inventory updated!`);
            } else {
                toast.error('Failed to update inventory');
            }
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setUpdating(null);
        }
    };

    const updateBankDetails = async () => {
        try {
            const res = await fetch('http://localhost:3001/api/blood-bank-user/bank', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bankForm)
            });

            if (res.ok) {
                const data = await res.json();
                setBank(data.bank);
                setEditingBank(false);
                toast.success('Bank details updated!');
            } else {
                toast.error('Failed to update bank details');
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const getInventoryForType = (type) => {
        const item = inventory.find(i => i.blood_type === type);
        return item?.units || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-rose-600 mx-auto mb-4" />
                    <p className="text-gray-500">Loading your blood bank...</p>
                </div>
            </div>
        );
    }

    if (!bank) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Blood Bank Associated</h2>
                    <p className="text-gray-500">Your account doesn't have a blood bank assigned yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{bank.name}</h1>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {bank.location}</span>
                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {bank.hours}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setEditingBank(true)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2"
                        >
                            Edit Details
                        </button>
                        <button
                            onClick={fetchBankData}
                            className="p-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                            title="Refresh"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Blood Inventory Grid */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-rose-500" />
                            Blood Inventory
                        </h2>
                        <span className="text-sm text-gray-500">Click + or - to update stock</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {bloodTypes.map((type) => {
                            const units = getInventoryForType(type);
                            const isLow = units < 5;
                            const isUpdating = updating === type;

                            return (
                                <motion.div
                                    key={type}
                                    whileHover={{ scale: 1.02 }}
                                    className={`relative rounded-2xl p-4 border-2 transition-all ${isLow
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-emerald-50 border-emerald-200'
                                        }`}
                                >
                                    {isLow && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <AlertTriangle className="w-3 h-3 text-white" />
                                        </div>
                                    )}

                                    <div className="text-center mb-3">
                                        <div className={`text-lg font-bold ${isLow ? 'text-red-700' : 'text-emerald-700'}`}>
                                            {type}
                                        </div>
                                        <div className={`text-3xl font-black ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {isUpdating ? <RefreshCw className="w-6 h-6 animate-spin mx-auto" /> : units}
                                        </div>
                                        <div className="text-xs text-gray-500">units</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateInventory(type, 'subtract')}
                                            disabled={isUpdating || units === 0}
                                            className="flex-1 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                                        >
                                            <Minus className="w-4 h-4 mx-auto text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => updateInventory(type, 'add')}
                                            disabled={isUpdating}
                                            className="flex-1 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                                        >
                                            <Plus className="w-4 h-4 mx-auto text-gray-600" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Blood Requests */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-rose-500" />
                            Recent Blood Requests
                        </h2>
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                            {requests.length} requests
                        </span>
                    </div>

                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No blood requests at the moment</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.slice(0, 10).map((req) => (
                                <div
                                    key={req.id}
                                    className={`p-4 rounded-xl border ${req.urgency === 'critical' ? 'border-red-200 bg-red-50' :
                                        req.urgency === 'urgent' ? 'border-amber-200 bg-amber-50' :
                                            'border-gray-200 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                                                {req.blood_type}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{req.patient_name}</h3>
                                                <p className="text-sm text-gray-500">{req.hospital}</p>
                                                <p className="text-xs text-gray-400">
                                                    Requested by: {req.requester_name || 'Unknown'} ({req.requester_email})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.urgency === 'critical' ? 'bg-red-500 text-white' :
                                                req.urgency === 'urgent' ? 'bg-amber-500 text-white' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>
                                                {req.urgency?.toUpperCase()}
                                            </span>
                                            <p className="text-sm text-gray-500 mt-1">{req.units_needed} units</p>
                                            <p className={`text-xs mt-1 ${req.status === 'fulfilled' ? 'text-green-600' :
                                                req.status === 'pending' ? 'text-amber-600' : 'text-gray-500'
                                                }`}>
                                                {req.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Bank Modal */}
            {editingBank && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md"
                    >
                        <h3 className="font-bold text-lg mb-4">Edit Blood Bank Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input
                                    type="text"
                                    value={bankForm.name}
                                    onChange={(e) => setBankForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={bankForm.location}
                                    onChange={(e) => setBankForm(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={bankForm.phone}
                                    onChange={(e) => setBankForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                                <input
                                    type="text"
                                    value={bankForm.hours}
                                    onChange={(e) => setBankForm(prev => ({ ...prev, hours: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500"
                                    placeholder="e.g., 9 AM - 5 PM"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => setEditingBank(false)}
                                className="flex-1 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateBankDetails}
                                className="flex-1 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BloodBankDashboard;

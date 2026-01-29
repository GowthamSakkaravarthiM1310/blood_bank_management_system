import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, Droplet, FileText, Building2, LogOut, Trash2, Edit2, Save, X,
    TrendingUp, Clock, Shield, Search, RefreshCw, ChevronDown, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [banks, setBanks] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('adminToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchData();
    }, [token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, usersRes, donorsRes, requestsRes, banksRes] = await Promise.all([
                fetch('http://localhost:3001/api/admin/stats', { headers }),
                fetch('http://localhost:3001/api/admin/users', { headers }),
                fetch('http://localhost:3001/api/admin/donors', { headers }),
                fetch('http://localhost:3001/api/admin/requests', { headers }),
                fetch('http://localhost:3001/api/admin/banks', { headers })
            ]);

            if (statsRes.ok) setStats((await statsRes.json()).stats);
            if (usersRes.ok) setUsers((await usersRes.json()).users);
            if (donorsRes.ok) setDonors((await donorsRes.json()).donors);
            if (requestsRes.ok) setRequests((await requestsRes.json()).requests);
            if (banksRes.ok) setBanks((await banksRes.json()).banks);

        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    const handleDeleteUser = (id) => {
        setDeleteConfirmation(id);
    };

    const confirmDeleteUser = async () => {
        if (!deleteConfirmation) return;

        try {
            const res = await fetch(`http://localhost:3001/api/admin/users/${deleteConfirmation}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('User deleted');
                setUsers(users.filter(u => u.id !== deleteConfirmation));
                setDeleteConfirmation(null);
            } else {
                const data = await res.json();
                toast.error(data.error);
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleUpdateUser = async (user) => {
        try {
            const res = await fetch(`http://localhost:3001/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (res.ok) {
                toast.success('User updated');
                setEditingUser(null);
                fetchData();
            }
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
            </div>
        </motion.div>
    );

    const tabs = [
        { id: 'overview', label: 'Overview', icon: TrendingUp },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'donors', label: 'Donors', icon: Droplet },
        { id: 'requests', label: 'Requests', icon: FileText },
        { id: 'banks', label: 'Blood Banks', icon: Building2 }
    ];

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-xs text-gray-500">LifeFlow Blood Bank</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
                            <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-rose-600 text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Total Users" value={stats.users || 0} color="bg-blue-500" />
                        <StatCard icon={Droplet} label="Registered Donors" value={stats.donors || 0} color="bg-rose-500" />
                        <StatCard icon={FileText} label="Blood Requests" value={stats.requests || 0} color="bg-amber-500" />
                        <StatCard icon={Clock} label="Pending Requests" value={stats.pendingRequests || 0} color="bg-purple-500" />
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-lg">All Users ({users.length})</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name || `${user.firstname} ${user.lastname}`}</p>
                                                    <p className="text-sm text-gray-500">@{user.username}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm">{user.email}</p>
                                                <p className="text-sm text-gray-500">{user.phone || '-'}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {user.city_village && `${user.city_village}, `}{user.district && `${user.district}, `}{user.state || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                                                    {user.blood_type || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.user_type === 'blood_bank' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {user.user_type === 'blood_bank' ? 'Blood Bank' : 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.email_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {user.email_verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingUser(user)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    {user.role !== 'admin' && (
                                                        <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-600" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Donors Tab */}
                {activeTab === 'donors' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-lg">Registered Donors ({donors.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {donors.map(donor => (
                                        <tr key={donor.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{donor.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">{donor.blood_group}</span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{donor.phone || donor.email}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{donor.city_village}, {donor.district}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${donor.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {donor.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {donors.length === 0 && (
                                        <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No donors registered yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="font-bold text-lg">Blood Requests ({requests.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{req.user_name || req.requester_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">@{req.username}</p>
                                                    <p className="text-xs text-gray-400">{req.user_email || req.requester_email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">{req.patient_name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">{req.blood_type}</span>
                                            </td>
                                            <td className="px-4 py-3">{req.units_needed}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{req.hospital}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                                                    req.urgency === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {req.urgency}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {requests.length === 0 && (
                                        <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No blood requests yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Banks Tab */}
                {activeTab === 'banks' && (
                    <div className="grid gap-6">
                        {banks.map(bank => (
                            <div key={bank.id} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{bank.name}</h3>
                                        <p className="text-gray-500">{bank.location}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{bank.hours}</span>
                                </div>
                                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                    {bank.inventory?.map(inv => (
                                        <div key={inv.blood_type} className="bg-gray-50 rounded-xl p-3 text-center">
                                            <p className="text-xs text-gray-500">{inv.blood_type}</p>
                                            <p className="text-xl font-bold text-rose-600">{inv.units}</p>
                                            <p className="text-xs text-gray-400">units</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={editingUser.name || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                placeholder="Name"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <input
                                type="tel"
                                value={editingUser.phone || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                placeholder="Phone"
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                            <select
                                value={editingUser.blood_type || ''}
                                onChange={(e) => setEditingUser({ ...editingUser, blood_type: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="">Blood Type</option>
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                value={editingUser.role || 'user'}
                                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            >
                                <option value="user">User</option>
                                <option value="donor">Donor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-6">
                            <button onClick={() => setEditingUser(null)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleUpdateUser(editingUser)} className="flex-1 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 w-full max-w-sm"
                    >
                        <div className="mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Confirm Delete</h3>
                            <p className="text-gray-500 mt-2">Are you sure you want to delete this user? This action cannot be undone.</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="flex-1 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplet, Calendar, Edit, Save, X, Loader2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


const UserProfile = () => {
    // Get real user data from AuthContext
    const { user: authUser, updateProfile, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: '',
        bloodType: ''
    });

    // Update form data when authUser changes
    useEffect(() => {
        if (authUser) {
            setFormData({
                name: authUser.name || '',
                phone: authUser.phone || '',
                location: authUser.location || '',
                bloodType: authUser.blood_type || ''
            });
        }
    }, [authUser]);

    // Create display user object with real data + defaults
    const user = {
        name: authUser?.name || "Guest User",
        role: authUser?.role === 'admin' ? 'Administrator' : 'Blood Donor',
        bloodType: authUser?.blood_type || "Not Set",
        email: authUser?.email || "Not available",
        phone: authUser?.phone || "Not set",
        location: authUser?.location || "Not set",
        lastDonation: "Not recorded",
        donationsCount: 0,
        avatar: authUser?.avatar_url || null
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await updateProfile({
                name: formData.name,
                phone: formData.phone,
                location: formData.location,
                bloodType: formData.bloodType
            });
            if (result.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header Background */}
                    <div className="h-32 bg-gradient-to-r from-rose-500 to-red-600"></div>

                    <div className="px-6 sm:px-10 pb-10">
                        <div className="relative flex justify-between items-end -mt-12 mb-8">
                            <div className="flex items-end">
                                <div className="relative group">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-rose-100 flex items-center justify-center text-rose-600 text-5xl font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;

                                                    const formData = new FormData();
                                                    formData.append('image', file);

                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const res = await fetch('http://localhost:3001/api/upload/profile-image', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`
                                                            },
                                                            body: formData
                                                        });
                                                        const data = await res.json();
                                                        if (res.ok) {
                                                            toast.success('Profile image updated');
                                                            updateProfile({ avatar_url: data.avatar_url });
                                                        } else {
                                                            toast.error(data.error || 'Failed to upload');
                                                        }
                                                    } catch (error) {
                                                        toast.error('Upload failed');
                                                    }
                                                }}
                                            />
                                            <div className="text-white text-xs font-medium text-center">
                                                <Edit className="w-6 h-6 mx-auto mb-1" />
                                                Change
                                            </div>
                                        </label>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Online"></div>
                                </div>
                                <div className="ml-6 mb-2 hidden sm:block">
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="text-3xl font-bold text-gray-900 border-b-2 border-rose-500 bg-transparent focus:outline-none"
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                    )}
                                    <p className="text-rose-600 font-medium flex items-center">
                                        {user.role} <Droplet className="w-4 h-4 ml-1 fill-current" />
                                    </p>
                                </div>
                            </div>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
                                >
                                    <Edit className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Mobile Name */}
                        <div className="sm:hidden mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-rose-600 font-medium">{user.role}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - Stats */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-6 border border-rose-100">
                                    <p className="text-sm text-rose-600 font-semibold uppercase tracking-wider text-center mb-4">Blood Type</p>
                                    {isEditing ? (
                                        <div className="grid grid-cols-4 gap-2">
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, bloodType: type })}
                                                    className={`relative p-3 rounded-xl font-bold text-sm transition-all duration-200 ${formData.bloodType === type
                                                        ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30 scale-105'
                                                        : 'bg-white text-rose-700 border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                                                        }`}
                                                >
                                                    <Droplet className={`w-4 h-4 mx-auto mb-1 ${formData.bloodType === type ? 'fill-white' : 'fill-rose-200'}`} />
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="relative">
                                                <Droplet className="w-20 h-20 text-rose-600 fill-rose-100" />
                                                <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-rose-700 mt-2">
                                                    {user.bloodType === 'Not Set' ? '?' : user.bloodType}
                                                </span>
                                            </div>
                                            {user.bloodType === 'Not Set' && (
                                                <p className="text-xs text-rose-400 mt-2">Click Edit to set your blood type</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4">Donation Stats</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Donations</p>
                                            <p className="text-xl font-bold text-gray-900">{user.donationsCount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Last Donation</p>
                                            <p className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {user.lastDonation}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Google Account Badge */}
                                {authUser?.google_id && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center gap-3">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <div>
                                            <p className="text-xs text-blue-600 font-medium">Connected with Google</p>
                                            <p className="text-sm text-gray-700">{authUser.email}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Info */}
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Contact Information</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Email</p>
                                                <p className="text-gray-900">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                {isEditing ? (
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="Enter phone number"
                                                        className="text-gray-900 border-b border-gray-300 focus:border-rose-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.phone}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Location</p>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        placeholder="Enter location"
                                                        className="text-gray-900 border-b border-gray-300 focus:border-rose-500 focus:outline-none w-full"
                                                    />
                                                ) : (
                                                    <p className="text-gray-900">{user.location}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Badges & Achievements</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {['New Member', 'Verified Account'].map((badge) => (
                                            <div key={badge} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-sm font-medium flex items-center gap-2">
                                                <span className="text-xl">🎖️</span> {badge}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Account</h3>
                                    <p className="text-sm text-gray-500">Manage your account settings</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        toast.success('Logged out successfully');
                                        navigate('/');
                                        window.location.reload();
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-xl font-medium transition-all border border-gray-200 hover:border-red-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplet, Calendar, Edit } from 'lucide-react';

const UserProfile = () => {
    // Mock user data
    const user = {
        name: "Alex Morgan",
        role: "Star Donor",
        bloodType: "O+",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, USA",
        lastDonation: "2023-10-15",
        donationsCount: 12,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };

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
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-rose-100 flex items-center justify-center text-rose-600 text-5xl font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white" title="Online"></div>
                                </div>
                                <div className="ml-6 mb-2 hidden sm:block">
                                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                    <p className="text-rose-600 font-medium flex items-center">
                                        {user.role} <Droplet className="w-4 h-4 ml-1 fill-current" />
                                    </p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2">
                                <Edit className="w-4 h-4" /> Edit Profile
                            </button>
                        </div>

                        {/* Mobile Name */}
                        <div className="sm:hidden mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-rose-600 font-medium">{user.role}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Left Column - Stats */}
                            <div className="md:col-span-1 space-y-6">
                                <div className="bg-rose-50 rounded-xl p-6 border border-rose-100 text-center">
                                    <p className="text-sm text-rose-600 font-semibold uppercase tracking-wider">Blood Type</p>
                                    <p className="text-5xl font-extrabold text-rose-700 mt-2">{user.bloodType}</p>
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
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                                <p className="text-gray-900">{user.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Location</p>
                                                <p className="text-gray-900">{user.location}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Badges & Achievements</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {['Life Saver', 'Regular Donor', 'Hero of 2024'].map((badge) => (
                                            <div key={badge} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full text-sm font-medium flex items-center gap-2">
                                                <span className="text-xl">🎖️</span> {badge}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;

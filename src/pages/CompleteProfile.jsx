import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Phone, MapPin, Droplet, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CompleteProfile = () => {
    const navigate = useNavigate();
    const { user: authUser, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [locations, setLocations] = useState({ states: [], districts: [], cities: [] });
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        bloodType: '',
        state: '',
        district: '',
        cityVillage: ''
    });

    // Redirect if user already has username (profile complete)
    useEffect(() => {
        if (authUser?.username) {
            navigate('/');
        }
    }, [authUser, navigate]);

    // Fetch states on mount
    useEffect(() => {
        fetch('http://localhost:3001/api/locations/states')
            .then(res => res.json())
            .then(data => setLocations(prev => ({ ...prev, states: data.states })))
            .catch(console.error);
    }, []);

    // Fetch districts when state changes
    useEffect(() => {
        if (formData.state) {
            fetch(`http://localhost:3001/api/locations/districts/${encodeURIComponent(formData.state)}`)
                .then(res => res.json())
                .then(data => setLocations(prev => ({ ...prev, districts: data.districts, cities: [] })))
                .catch(console.error);
        }
    }, [formData.state]);

    // Fetch cities when district changes
    useEffect(() => {
        if (formData.district) {
            fetch(`http://localhost:3001/api/locations/cities/${encodeURIComponent(formData.district)}`)
                .then(res => res.json())
                .then(data => setLocations(prev => ({ ...prev, cities: data.cities })))
                .catch(console.error);
        }
    }, [formData.district]);

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username) {
            toast.error('Username is required');
            return;
        }

        if (formData.password && formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/auth/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password || null,
                    phone: formData.phone || null,
                    bloodType: formData.bloodType || null,
                    state: formData.state || null,
                    district: formData.district || null,
                    cityVillage: formData.cityVillage || null
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Profile completed successfully!');
                // Update local user data
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
                window.location.reload();
            } else {
                toast.error(data.error || 'Failed to complete profile');
            }
        } catch (error) {
            toast.error('Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 p-4 pt-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {authUser?.avatar_url ? (
                            <img src={authUser.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-rose-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
                    <p className="text-gray-500 mt-1">Welcome! Please fill in additional details to get started.</p>
                    {authUser?.email && (
                        <p className="text-sm text-rose-600 mt-2 font-medium">{authUser.email}</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className={labelClass}>Username *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`${inputClass} pl-11`}
                                placeholder="Choose a unique username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password (Optional for Google users) */}
                    <div>
                        <label className={labelClass}>Password (Optional)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`${inputClass} pl-11 pr-11`}
                                placeholder="Set a password for email login"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Optional: Set a password to login with email too</p>
                    </div>

                    {formData.password && (
                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Confirm your password"
                            />
                        </div>
                    )}

                    {/* Phone */}
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`${inputClass} pl-11`}
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>

                    {/* Blood Type */}
                    <div>
                        <label className={labelClass}>Blood Group</label>
                        <div className="grid grid-cols-4 gap-2">
                            {bloodTypes.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                                    className={`p-3 rounded-xl font-bold text-sm transition-all ${formData.bloodType === type
                                        ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg'
                                        : 'bg-white border-2 border-rose-200 text-rose-700 hover:border-rose-400'
                                        }`}
                                >
                                    <Droplet className={`w-4 h-4 mx-auto mb-1 ${formData.bloodType === type ? 'fill-white' : 'fill-rose-200'}`} />
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>State</label>
                            <select
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">Select State</option>
                                {locations.states.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>District</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                className={inputClass}
                                disabled={!formData.state}
                            >
                                <option value="">Select District</option>
                                {locations.districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>City / Village</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="cityVillage"
                                value={formData.cityVillage}
                                onChange={handleChange}
                                className={`${inputClass} pl-11`}
                                placeholder="Enter your city or village"
                                list="cities"
                            />
                            <datalist id="cities">
                                {locations.cities.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Complete Profile
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CompleteProfile;

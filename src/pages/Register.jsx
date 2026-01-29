import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, MapPin, Droplet, Eye, EyeOff, Loader2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [locations, setLocations] = useState({ states: [], districts: [], cities: [] });
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstname: '',
        lastname: '',
        age: '',
        phone: '',
        bloodType: '',
        state: '',
        district: '',
        cityVillage: ''
    });

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

    const validateStep1 = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill all required fields');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.firstname || !formData.lastname) {
            toast.error('First and Last name are required');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Registration successful! You can now login.');
                navigate('/login');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch (error) {
            toast.error('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-rose-600 mb-4">
                            <Droplet className="w-8 h-8" fill="currentColor" />
                            <span className="text-2xl font-bold">LifeFlow</span>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                        <p className="text-gray-500 mt-1">Step {step} of 3</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`flex-1 h-2 rounded-full transition-colors ${s <= step ? 'bg-rose-500' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">

                        {/* Step 1: Account Details */}
                        {step === 1 && (
                            <>
                                <div>
                                    <label className={labelClass}>Username *</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleChange} className={inputClass} placeholder="Choose a username" />
                                </div>
                                <div>
                                    <label className={labelClass}>Email *</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="your@email.com" />
                                </div>
                                <div>
                                    <label className={labelClass}>Password *</label>
                                    <div className="relative">
                                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Confirm Password *</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                                </div>
                                <button onClick={() => validateStep1() && setStep(2)} className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                                    Continue <ArrowRight size={18} />
                                </button>
                            </>
                        )}

                        {/* Step 2: Personal Info */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>First Name *</label>
                                        <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className={inputClass} placeholder="John" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name *</label>
                                        <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className={inputClass} placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Age</label>
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} className={inputClass} placeholder="25" min="18" max="65" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 9876543210" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Blood Group</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {bloodTypes.map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                                                className={`p-3 rounded-xl font-bold text-sm transition-all ${formData.bloodType === type ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg' : 'bg-white border-2 border-rose-200 text-rose-700 hover:border-rose-400'}`}
                                            >
                                                <Droplet className={`w-4 h-4 mx-auto mb-1 ${formData.bloodType === type ? 'fill-white' : 'fill-rose-200'}`} />
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={() => validateStep2() && setStep(3)} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Location */}
                        {step === 3 && (
                            <>
                                <div>
                                    <label className={labelClass}>State</label>
                                    <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                                        <option value="">Select State</option>
                                        {locations.states.map(state => <option key={state} value={state}>{state}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>District</label>
                                    <select name="district" value={formData.district} onChange={handleChange} className={inputClass} disabled={!formData.state}>
                                        <option value="">Select District</option>
                                        {locations.districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>City / Village</label>
                                    <input type="text" name="cityVillage" value={formData.cityVillage} onChange={handleChange} className={inputClass} placeholder="Enter your city or village" list="cities" />
                                    <datalist id="cities">
                                        {locations.cities.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleRegister} disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Register'}
                                    </button>
                                </div>
                            </>
                        )}


                    </motion.div>

                    <p className="text-center text-gray-500 mt-6">
                        Already have an account? <Link to="/login" className="text-rose-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>

            {/* Right Side - Hero */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 items-center justify-center p-12">
                <div className="text-center text-white">
                    <Droplet className="w-24 h-24 mx-auto mb-6 opacity-80" fill="currentColor" />
                    <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
                    <p className="text-xl opacity-90 max-w-md">Register today and become a hero. Your donation can save up to 3 lives.</p>
                </div>
            </div>
        </div>
    );
};

export default Register;

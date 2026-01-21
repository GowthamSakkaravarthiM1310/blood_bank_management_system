import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Users, Activity, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRealtime } from '../context/RealtimeContext';

const Home = () => {
  const { liveStats } = useRealtime();

  const stats = [
    { icon: Users, label: 'Active Donors', value: liveStats.donorsOnline, color: 'text-blue-500', bg: 'bg-blue-100' },
    { icon: Activity, label: 'Requests Today', value: liveStats.requestsActive, color: 'text-rose-500', bg: 'bg-rose-100' },
    { icon: Heart, label: 'Lives Saved', value: liveStats.livesSaved, color: 'text-green-500', bg: 'bg-green-100' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-20"> {/* pt-20 for navbar spacer */}
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/50 via-slate-50 to-slate-50 -z-10"></div>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-rose-100 text-rose-600 text-sm font-semibold mb-6">
              Realtime Blood Bank Network
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
              Donate Blood. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">
                Save a Life Today.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect directly with donors and recipients in realtime.
              Our advanced platform ensures that no request goes unheard and help arrives when it matters most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/donor" className="w-full sm:w-auto px-8 py-4 bg-rose-600 text-white rounded-xl font-bold text-lg hover:bg-rose-700 transition shadow-lg shadow-rose-500/30 flex items-center justify-center">
                Donate Now <Heart className="ml-2 h-5 w-5 fill-current" />
              </Link>
              <Link to="/request" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition shadow-sm flex items-center justify-center">
                Request Blood <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 bg-white/50 backdrop-blur-sm border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4"
              >
                <div className={`p-4 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Ticker (Simulation) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
              Live Activity
            </h2>
            <Link to="/dashboard" className="text-rose-600 font-medium hover:text-rose-700">View All &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded">URGENT</span>
                  <span className="text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> 2m ago</span>
                </div>
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold text-lg mr-3">
                    A+
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">City General Hospital</h3>
                    <p className="text-sm text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" /> New York, NY</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>3/5 Units Found</span>
                  <span>60% Fulfilled</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

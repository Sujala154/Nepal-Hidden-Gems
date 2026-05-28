import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    FaUsers,
    FaMapMarkedAlt,
    FaUserTie,
    FaChartLine,
    FaSpinner,
    FaCheckCircle,
    FaClock,
    FaGlobeAmericas,
    FaArrowUp,
    FaCompass
} from 'react-icons/fa';

const AnalyticsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Aggregating Statistics...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-500 font-bold text-lg mb-2">Failed to load analytics</p>
                <p className="text-slate-500 text-sm">The analytics endpoint is not available yet.</p>
            </div>
        );
    }

    const StatCard = ({ icon: Icon, label, value, color, trend }) => (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 opacity-5 transition-transform group-hover:scale-110 ${color}`}>
                <Icon size={100} />
            </div>
            <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${color.replace('text-', 'bg-').replace('-500', '-50')}`}>
                    <Icon className={color} />
                </div>
                <div>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</p>
                    <h3 className="text-xl font-black text-slate-900 leading-none">{value}</h3>
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase">
                    <FaArrowUp /> {trend} Growth
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Platform Intelligence</h2>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-sm border border-emerald-50">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse" /> Live Metrics
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FaUsers}
                    label="Total Community"
                    value={stats.users.total}
                    color="text-indigo-600"
                    trend="12%"
                />
                <StatCard
                    icon={FaMapMarkedAlt}
                    label="Hidden Gems"
                    value={stats.destinations.total}
                    color="text-amber-600"
                    trend="8%"
                />
                <StatCard
                    icon={FaUserTie}
                    label="Local Guides"
                    value={stats.users.guides}
                    color="text-emerald-600"
                    trend="15%"
                />
                <StatCard
                    icon={FaCompass}
                    label="Explorers"
                    value={stats.users.travelers}
                    color="text-sky-600"
                    trend="22%"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Destination Status Breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <FaGlobeAmericas className="text-amber-500" /> Content Distribution
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-black text-slate-500 uppercase">Approved Destinations</span>
                                <span className="text-sm font-bold text-emerald-600">{stats.destinations.approved} verified</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${(stats.destinations.approved / stats.destinations.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-black text-slate-500 uppercase">Pending Moderation</span>
                                <span className="text-sm font-bold text-amber-600">{stats.destinations.pending} waiting</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                    style={{ width: `${(stats.destinations.pending / stats.destinations.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-black text-slate-500 uppercase">Rejected / Hidden</span>
                                <span className="text-sm font-bold text-red-600">{stats.destinations.rejected} items</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-400 transition-all duration-1000"
                                    style={{ width: `${(stats.destinations.rejected / stats.destinations.total) * 100}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-50">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Contributors</p>
                                <p className="text-lg font-bold text-slate-800">{stats.users.contributors}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Authored</p>
                                <p className="text-lg font-bold text-slate-800">{(stats.destinations.total / (stats.users.contributors || 1)).toFixed(1)} avg</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Growth Rate</p>
                                <p className="text-lg font-bold text-emerald-500">+12%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Locations Ranking */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <FaChartLine className="text-indigo-500" /> Geographic Popularity
                    </h3>
                    <div className="space-y-4">
                        {stats.destinations.topLocations.map((loc, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-bold text-slate-700">{loc._id}</span>
                                        <span className="text-xs font-black text-slate-400">{loc.count} gems</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600/20 group-hover:bg-indigo-600 transition-all duration-500"
                                            style={{ width: `${(loc.count / stats.destinations.topLocations[0].count) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* User Growth Trend (Mock Visualization) */}
            <div className="bg-slate-50 rounded-[32px] p-6 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mt-32 -mr-32 blur-3xl group-hover:bg-amber-50 transition-colors duration-1000" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="lg:w-1/3">
                        <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Community Momentum</h3>
                        <p className="text-slate-500 leading-relaxed mb-8">
                            Participation has increased significantly this quarter. Our community of over <strong className="text-indigo-600">{stats.users.total}</strong> members is actively mapping Nepal's unmapped beauty.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <FaCheckCircle size={14} />
                                </div>
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Verified Guide Network Up 15%</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <FaClock size={14} />
                                </div>
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Moderate Response Time: 4.2h</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full h-64 flex items-end justify-between gap-4">
                        {stats.growth.map((g, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                <div className="relative w-full flex items-end justify-center h-full">
                                    <div
                                        className="w-full max-w-[50px] bg-slate-200 rounded-2xl transition-all duration-700 group-hover/bar:bg-indigo-600 group-hover/bar:shadow-xl group-hover/bar:shadow-indigo-500/20 origin-bottom"
                                        style={{ height: `${(g.users / 80) * 100}%` }}
                                    />
                                    <div className="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                                        {g.users} USERS
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest group-hover/bar:text-indigo-600 transition-colors">{g.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;

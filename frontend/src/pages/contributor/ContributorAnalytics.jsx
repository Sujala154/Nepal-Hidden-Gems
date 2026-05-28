import React, { useState, useEffect } from 'react';
import { 
  FaEye, 
  FaHeart, 
  FaCommentDots, 
  FaChartLine, 
  FaTrophy,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Mock data for the chart
const chartData = [
  { name: '1 Jan', views: 40, saves: 24 },
  { name: '5 Jan', views: 30, saves: 13 },
  { name: '10 Jan', views: 80, saves: 40 },
  { name: '15 Jan', views: 120, saves: 65 },
  { name: '20 Jan', views: 100, saves: 50 },
  { name: '25 Jan', views: 150, saves: 85 },
  { name: '30 Jan', views: 180, saves: 94 },
];

const topDestinations = [
  { id: 1, name: 'Phoksundo Lake', views: 450, saves: 120, growth: '+12%' },
  { id: 2, name: 'Tsho Rolpa', views: 380, saves: 95, growth: '+8%' },
  { id: 3, name: 'Barun Valley', views: 290, saves: 40, growth: '-2%' },
];

const ContributorAnalytics = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Views', value: '1,240', icon: FaEye, trend: '+14%', up: true },
    { label: 'Destinations Saved', value: '342', icon: FaHeart, trend: '+5%', up: true },
    { label: 'Inquiries', value: '18', icon: FaCommentDots, trend: '+20%', up: true },
    { label: 'Impact Score', value: '92', icon: FaTrophy, trend: 'Top 5%', up: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Performance overview of your shared gems</h2>
          <FaChartLine className="text-amber-500 w-5 h-5 animate-pulse" />
        </div>
        <div className="px-4 py-2 bg-white border border-slate-100 rounded-lg shadow-sm text-[10px] font-black text-slate-500 uppercase tracking-widest">
           Last 30 Days
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <stat.icon className="w-3 h-3" />
              </div>
              <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${stat.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.up ? <FaArrowUp className="w-2 h-2" /> : <FaArrowDown className="w-2 h-2" />} {stat.trend}
              </div>
            </div>
            <h3 className="text-xl font-black text-[#0b1f3a] tracking-tighter leading-none">{stat.value}</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-[10px] font-black text-[#0b1f3a] uppercase tracking-widest">Destination Views</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Traffic across all your locations</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Views</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Saves</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorViews)" 
              />
              <Area 
                type="monotone" 
                dataKey="saves" 
                stroke="#cbd5e1" 
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Destinations Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-sm font-black text-[#0b1f3a] uppercase tracking-widest">Top Performing Gems</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Views</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Saves</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">30d Growth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {topDestinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                        <FaChartLine className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-bold text-[#0b1f3a]">{dest.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-black text-slate-600">{dest.views}</td>
                  <td className="px-6 py-4 text-center text-sm font-black text-slate-600">{dest.saves}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                      dest.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {dest.growth}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContributorAnalytics;

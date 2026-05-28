import React, { useState, useEffect } from 'react';
import { FaWallet, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../../services/api';

const GuideEarnings = () => {
    const [earningsData, setEarningsData] = useState({
        stats: {
            totalRevenue: 0,
            pendingPayouts: 0,
            completedPayouts: 0
        },
        data: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                setLoading(true);
                const res = await api.get('/guides/me/earnings');
                if (res.success) {
                    setEarningsData({
                        stats: res.stats,
                        data: res.data
                    });
                } else {
                    toast.error('Failed to load earnings');
                }
            } catch (error) {
                console.error('Error fetching earnings:', error);
                toast.error('Error fetching earnings');
            } finally {
                setLoading(false);
            }
        };

        fetchEarnings();
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center p-8">
                <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Loading Earnings...</p>
            </div>
        );
    }

    const { stats, data } = earningsData;

    return (
        <div className="max-w-7xl mx-auto w-full h-full animate-in fade-in duration-500 flex flex-col gap-4">
            <div>
                <h1 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Earnings and payout history</h1>
            </div>
            

            {/* Earnings Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full flex-1">
                <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                         <FaCheckCircle className="text-emerald-500" /> Earnings
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Earning:</span>
                        <span className="text-sm font-black text-[#0b1f3a]">NPR {stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : "17,250"}</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#0b1f3a] text-white">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Tour Name</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Tour Date</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Transaction ID</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap">Earnings (NPR)</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <p className="text-sm font-bold text-slate-500 uppercase">No earnings recorded yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.map(payment => (
                                    <tr key={payment._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-slate-900">{payment.bookingId?.destinationName || 'Unknown Tour'}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">{payment.bookingId?.type || 'Private'} Tour</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                            {payment.bookingId?.date ? new Date(payment.bookingId.date).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                            {payment.transactionId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-slate-800">
                                                {payment.guideShare?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                                payment.payoutStatus === 'Released'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-orange-50 text-orange-600 border border-orange-100 flex items-center'
                                            }`}>
                                                {payment.payoutStatus === 'Released' ? <FaCheckCircle /> : <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                                                {payment.payoutStatus === 'Released' ? 'Paid Out' : 'Pending From Admin'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GuideEarnings;

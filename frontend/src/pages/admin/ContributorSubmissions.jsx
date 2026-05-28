import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaArrowLeft, FaEye, FaSpinner, FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import UnifiedDestinationContainer from '../../components/common/UnifiedDestinationContainer';

const ContributorSubmissions = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destinations, setDestinations] = useState([]);
    const [contributor, setContributor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDest, setSelectedDest] = useState(null);

    const fetchDestinations = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/users/${id}/destinations`);
            if (res.success) {
                setDestinations(res.data);
                setContributor(res.contributor);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDestinations();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="text-amber-500 text-4xl animate-spin mb-4" />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Portfolio...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-6">
                <button 
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:border-amber-500 hover:text-amber-500 hover:shadow-md transition-all w-fit"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
                    Back
                </button>

                <div className="flex justify-between items-end border-b border-slate-100 pb-8">
                    <div>
                        <h2 className="text-3xl font-black text-[#0b1f3a] uppercase tracking-tighter">
                            {contributor?.name || 'Contributor'}'s Portfolio
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                             Full history of submitted hidden gems
                        </p>
                    </div>
                    <div className="bg-amber-100 text-amber-700 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">
                        {destinations.length} Total Submissions
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start h-[calc(100vh-250px)]">
                {/* List of Destinations */}
                <div className="xl:col-span-1 space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
                    {destinations.length === 0 ? (
                        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center">
                            <p className="text-slate-500 font-bold">No submissions yet.</p>
                        </div>
                    ) : (
                        destinations.map(dest => (
                            <div 
                                key={dest._id}
                                onClick={() => setSelectedDest(dest)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                                    ${selectedDest?._id === dest._id 
                                        ? 'bg-amber-50 border-amber-200 shadow-md ring-1 ring-amber-200' 
                                        : 'bg-white border-slate-100 hover:border-amber-200 shadow-sm'}`}
                            >
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img 
                                            src={buildBackendUrl(dest.image)} 
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-bold text-slate-900 truncate text-sm">{dest.name}</h4>
                                            {dest.approved ? (
                                                <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase flex-shrink-0">Live</span>
                                            ) : (
                                                <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase flex-shrink-0">Pending</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <FaMapMarkerAlt className="text-amber-500 text-[10px]" /> {dest.location}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                                            <FaCalendarAlt /> {new Date(dest.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detailed View */}
                <div className="xl:col-span-2 h-full overflow-hidden flex flex-col">
                    {selectedDest ? (
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Preview Header */}
                            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedDest.approved ? 'bg-green-500' : 'bg-amber-500'}`}>
                                        {selectedDest.approved ? <FaCheck className="text-white text-sm" /> : <FaEye className="text-slate-900 text-sm" />}
                                    </div>
                                    <div>
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${selectedDest.approved ? 'text-green-400' : 'text-amber-500'}`}>
                                            {selectedDest.approved ? 'Published Content' : 'Pending Review'}
                                        </p>
                                        <h3 className="font-bold text-base leading-tight">{selectedDest.name}</h3>
                                    </div>
                                </div>
                                {selectedDest.approved && (
                                    <a 
                                        href={`/destinations/${selectedDest.slug}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
                                    >
                                        View Live <FaExternalLinkAlt className="text-[10px]" />
                                    </a>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <UnifiedDestinationContainer destination={selectedDest} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <FaEye className="text-3xl opacity-50" />
                             </div>
                             <h3 className="text-xl font-bold text-slate-800 mb-2">Select a destination</h3>
                             <p className="max-w-xs text-sm">Choose from the list on the left to view full details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContributorSubmissions;

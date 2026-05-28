import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import destinationService from '../../services/destinationService';
import DestinationForm from './DestinationForm';

const UploadDestinations = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    tagline: '',
    budgetLevel: 'Mid-Range',
    description: '',
    long_description: '',
    difficulty: 'moderate',
    bestSeason: 'all',
    category: 'Nature',
    specialty: '',
    hospitality: '',
    accommodation: '',
    tips: '',
    image: null,
    images: []
  });

  const handleSubmit = async (submitData) => {
    setLoading(true);
    setError('');

    try {
      await destinationService.createDestination(submitData);

      if (onUploadSuccess) onUploadSuccess();
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to add destination');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/contributor/submissions');
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="mb-4">
        <h2 className="text-xl font-black text-[#0b1f3a] uppercase tracking-tighter leading-none">Add New Destination</h2>
      </div>

      <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 overflow-hidden transition-all duration-500 hover:shadow-2xl">


        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <DestinationForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          buttonText="Add Destination"
        />
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#0b1f3a] uppercase tracking-tight mb-2">Success!</h3>
            <p className="text-slate-500 text-[11px] font-medium mb-6">
              Destination added successfully! It has been submitted for review.
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full py-3 bg-[#0b1f3a] text-white rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 shadow-xl shadow-blue-900/10 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDestinations;

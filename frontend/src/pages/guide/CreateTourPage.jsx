import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaTimes, FaMoneyBillWave, FaClock, FaTag, FaImage, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateTourPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'NPR',
    duration: '',
    categories: [],
    photos: []
  });

  const categories = ['Adventure', 'Culture', 'Food', 'Hiking', 'Nature', 'Wildlife', 'Spiritual', 'History'];
  const durations = ['1-3 Hours', 'Half Day (4-5 Hours)', 'Full Day (8+ Hours)', 'Multi-Day'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
  };

  const removePhoto = (index) => {
    setFormData(prev => {
        const removed = prev.photos[index];
        if (removed.preview.startsWith('blob:')) URL.revokeObjectURL(removed.preview);
        return {
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.categories.length === 0) {
        return toast.error('Please select at least one category');
    }

    setLoading(true);
    
    try {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('currency', formData.currency);
        data.append('duration', formData.duration);
        data.append('categories', formData.categories.join(','));

        formData.photos.forEach(photo => {
            if (photo.file) {
                data.append('photos', photo.file);
            }
        });

        const res = await api.post('/tours', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.success) {
            toast.success('Experience Published Successfully!');
            navigate('/guide/tours');
        } else {
            toast.error(res.error || 'Failed to publish tour');
        }
    } catch (error) {
        console.error('Submission Error:', error);
        toast.error(error.response?.data?.error || 'Failed to publish tour');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full pb-20 animate-in fade-in duration-500">
      <div className="mb-4 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#0b1f3a] tracking-tighter uppercase transition-all">Add New Experience</h1>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest pl-0.5">Define your signature travel experience</p>
        </div>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
           <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-75" />
           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Basic Info Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all hover:border-amber-200">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-400" />
          <h2 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm">
              <FaTag className="text-xs" />
            </div>
            1. Tour Essence
          </h2>

          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
               <div className="md:col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tour Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Hidden Temples of Kathmandu"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-400 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                    required
                  />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Categories (Select Multi)</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {categories.slice(0, 4).map(cat => (
                      <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border ${formData.categories.includes(cat) ? 'bg-amber-400 border-amber-500 text-white' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">The Experience (Description)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="What makes this special..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-400 transition-all font-medium text-slate-700 placeholder:text-slate-300 resize-none"
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Logistics Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all hover:border-blue-200">
          <div className="absolute left-0 top-0 w-1 h-full bg-blue-500" />
          <h2 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shadow-sm">
              <FaClock className="text-xs" />
            </div>
            2. Logistics & Pricing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pricing</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-black text-[10px]">{formData.currency === 'USD' ? '$' : 'NPR'}</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  required
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="absolute inset-y-1.5 right-1.5 px-2 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 focus:outline-none cursor-pointer uppercase"
                >
                  <option value="NPR">NPR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tour Duration</label>
              <div className="relative">
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-400 transition-all font-bold text-slate-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled>Select</option>
                  {durations.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <FaClock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px]" />
              </div>
            </div>

            <div className="flex items-end">
               <div className="flex flex-wrap gap-1">
                 {categories.slice(4).map(cat => (
                   <button key={cat} type="button" onClick={() => handleCategoryToggle(cat)} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter border ${formData.categories.includes(cat) ? 'bg-blue-500 border-blue-600 text-white' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                     {cat}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Photos Section */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group transition-all hover:border-emerald-200">
           <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500" />
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-3 uppercase tracking-tighter">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                  <FaImage className="text-xs" />
                </div>
                3. Gallery
              </h2>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Max 5 Dynamic Photos</p>
           </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="relative h-24 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-400 hover:bg-emerald-50/20 transition-all cursor-pointer group/upload">
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <FaCloudUploadAlt className="text-xl text-slate-300 group-hover/upload:text-emerald-500 transition-all" />
              <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">Add Photo</span>
            </div>
            
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative h-24 rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={photo.preview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                  <FaTimes className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/guide/tours')}
            className="px-6 py-3 rounded-xl font-black text-slate-400 uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-5 bg-[#0b1f3a] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-900/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish Experience'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateTourPage;

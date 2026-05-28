import React, { useState, useEffect } from 'react';
import { FaPlus, FaMapMarkerAlt, FaTag, FaImage, FaSpinner, FaWallet } from 'react-icons/fa';

const DestinationForm = ({ formData, setFormData, onSubmit, loading, buttonText }) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isHovered, setIsHovered] = useState(null);

  useEffect(() => {
    // Handle previews for multiple images
    if (formData.images && formData.images.length > 0) {
      const urls = formData.images.map(img => {
        if (img instanceof File) return URL.createObjectURL(img);
        return img.startsWith('http') ? img : `http://localhost:5000${img}`;
      });
      setPreviewUrls(urls);
      return () => urls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
    } else if (formData.image) {
      // Fallback for single image (compatibility)
      const url = formData.image instanceof File 
        ? URL.createObjectURL(formData.image) 
        : (formData.image.startsWith('http') ? formData.image : `http://localhost:5000${formData.image}`);
      setPreviewUrls([url]);
      return () => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); };
    } else {
      setPreviewUrls([]);
    }
  }, [formData.images, formData.image]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [imageError, setImageError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.images || formData.images.length === 0) {
      setImageError(true);
      const gallerySection = document.getElementById('gallery-section');
      if (gallerySection) {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setImageError(false);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        formData.images.forEach(img => {
          if (img instanceof File) {
            data.append('images', img);
          } else {
            // Existing image string path
            data.append('existingImages', img);
          }
        });
      } else if (key !== 'image') { // ignore old singular image field
        data.append(key, formData[key]);
      }
    });

    // If there's an old singular image and no new multiple images, maintain it
    if ((!formData.images || formData.images.length === 0) && formData.image) {
      if (formData.image instanceof File) {
        data.append('images', formData.image);
      } else {
        data.append('existingImages', formData.image);
      }
    }

    onSubmit(data);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageError(false);
      // Limit to 5 images total
      const newImages = [...(formData.images || []), ...files].slice(0, 5);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      newImages.splice(index, 1);
      if (newImages.length === 0) setImageError(true);
      return { ...prev, images: newImages };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Destination Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="e.g. Rara Lake"
            className="input-premium ring-offset-2 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="District or Province"
              className="input-premium pl-12 ring-offset-2 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tagline (Short Summary)</label>
          <div className="relative">
            <FaTag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
              required
              placeholder="A pristine alpine gem..."
              className="input-premium pl-12 ring-offset-2 py-3"
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-1">Budget Level</label>
           <div className="relative">
             <FaWallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="budgetLevel"
                value={formData.budgetLevel || 'Mid-Range'}
                onChange={handleChange}
                className="w-full pl-12 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all appearance-none font-medium text-sm"
              >
               <option value="Budget-Friendly">Budget-Friendly</option>
               <option value="Mid-Range">Mid-Range</option>
               <option value="Luxury">Luxury</option>
               <option value="Ultra-Luxury">Ultra-Luxury</option>
             </select>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all font-medium text-sm"
          >
            {['Adventure', 'Culture', 'Food', 'Hiking', 'Nature', 'Wildlife', 'Spiritual', 'History'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="input-premium ring-offset-2 py-3"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Best Season</label>
          <select
            name="bestSeason"
            value={formData.bestSeason}
            onChange={handleChange}
            className="input-premium ring-offset-2 py-3"
          >
            <option value="all">All Year Round</option>
            <option value="spring">Spring (Mar-May)</option>
            <option value="summer">Summer (Jun-Aug)</option>
            <option value="autumn">Autumn (Sep-Nov)</option>
            <option value="winter">Winter (Dec-Feb)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="3"
          placeholder="Tell the story of this destination..."
          className="input-premium ring-offset-2 resize-none py-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Specialty & Atmosphere</label>
          <textarea
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            required
            rows="2"
            placeholder="What makes the vibe unique?"
            className="input-premium ring-offset-2 resize-none py-3"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Local Food & Hospitality</label>
          <textarea
            name="hospitality"
            value={formData.hospitality}
            onChange={handleChange}
            required
            rows="2"
            placeholder="Must-try local dishes..."
            className="input-premium ring-offset-2 resize-none py-3"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Accommodation & Stay</label>
        <textarea
          name="accommodation"
          value={formData.accommodation}
          onChange={handleChange}
          required
          rows="2"
          placeholder="Where should travelers sleep?"
          className="input-premium ring-offset-2 resize-none text-sm py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Local Insider Tips</label>
        <textarea
          name="tips"
          value={formData.tips}
          onChange={handleChange}
          required
          rows="2"
          placeholder="e.g. Best time for sunrise, local customs to follow..."
          className="input-premium ring-offset-2 resize-none text-sm py-3"
        />
      </div>

      <div id="gallery-section" className={`p-6 rounded-2xl transition-all duration-300 border-2 ${imageError ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <label className={`block text-sm font-bold transition-colors ${imageError ? 'text-red-600' : 'text-[#0b1f3a]'}`}>
              Gallery Photos (Max 5)
            </label>
            {imageError && (
               <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse px-2 py-0.5 bg-red-100 rounded-full">
                 * At least one image is required
               </span>
            )}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${imageError ? 'text-red-400' : 'text-slate-400'}`}>
            {previewUrls.length} / 5
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div 
               key={index} 
               className="relative h-32 rounded-2xl overflow-hidden border-2 border-white group shadow-sm hover:shadow-md transition-all"
               onMouseEnter={() => setIsHovered(index)}
               onMouseLeave={() => setIsHovered(null)}
            >
              <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span className="text-lg">&times;</span>
              </button>
            </div>
          ))}

          {previewUrls.length < 5 && (
            <div className={`relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${imageError ? 'border-red-300 bg-white hover:bg-red-50' : 'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FaPlus className={`${imageError ? 'text-red-400 group-hover:text-red-600' : 'text-slate-300 group-hover:text-indigo-500'} mb-1`} />
              <span className={`text-[10px] font-bold uppercase ${imageError ? 'text-red-400 group-hover:text-red-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>Add Photo</span>
            </div>
          )}
        </div>
        {imageError && (
          <p className="mt-4 text-[11px] font-bold text-red-500 uppercase tracking-tighter flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            Please upload at least one image before publishing
          </p>
        )}
      </div>

      <div className="flex justify-end items-center pt-6 border-t border-slate-100">
        <button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
            imageError 
            ? 'bg-red-500 text-white shadow-red-200 hover:bg-red-600' 
            : 'bg-[#0b1f3a] text-white shadow-blue-900/10 hover:bg-slate-800'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              {buttonText || 'Publish Destination'}
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${imageError ? 'bg-white/50' : 'bg-indigo-400'}`}></div>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default DestinationForm;

/**
 * DestinationCard.jsx
 *
 * Presentational card used across the Destinations and Explore pages.
 * Renders an image hero with an overlay for the title and location,
 * followed by a stats bar showing rating, description, visitor count,
 * and a colour-coded difficulty badge.
 */
import React from 'react';
import { MapPin, Star, Users } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

// Maps difficulty values to their corresponding Tailwind colour sets.
const DIFFICULTY_STYLES = {
  easy: 'bg-green-50 text-green-700 border border-green-100',
  moderate: 'bg-amber-50 text-amber-700 border border-amber-100',
  difficult: 'bg-orange-50 text-orange-700 border border-orange-100',
};

const DestinationCard = ({ destination }) => {
  const {
    name,
    image,
    location,
    category,
    rating,
    numReviews,
    description,
    visitors,
    difficulty,
  } = destination;

  const difficultyStyle = DIFFICULTY_STYLES[difficulty] || 'bg-red-50 text-red-700 border border-red-100';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 group px-6">
      {/* ── Image Hero ── */}
      <div className="relative h-48 overflow-hidden cursor-default">
        <img
          src={getImageUrl(image)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=Nepal+Hidden+Gem'; }}
          alt={name}
        />
        {/* Dark gradient so the title text remains legible over any image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Title & Location overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-xl font-bold mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center text-slate-200 text-[11px] font-semibold">
            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
            <span className="line-clamp-1">{location || 'Nepal'}</span>
          </div>
        </div>

        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg z-10">
            {category}
          </span>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-5 flex flex-col h-full">
        {/* Rating row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5">
            <Star className={`w-4 h-4 ${rating > 0 ? 'text-amber-500 fill-current' : 'text-slate-300'}`} />
            <span className="text-sm font-bold text-slate-700">
              {Number(rating || 0).toFixed(1)}
            </span>
            <span className="text-slate-300 text-xs ml-1">({numReviews || 0})</span>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-5 line-clamp-2 leading-relaxed">
          {description || 'A beautiful hidden gem waiting to be discovered.'}
        </p>

        {/* Footer: visitor count + difficulty */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 mr-1.5 text-slate-300" />
            <span>{visitors || 0} visits</span>
          </div>

          {difficulty && (
            <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${difficultyStyle}`}>
              {difficulty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
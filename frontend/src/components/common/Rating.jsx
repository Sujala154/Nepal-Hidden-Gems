import React from 'react';
import { FaStar } from 'react-icons/fa';

const Rating = ({ rating, maxRating = 5, size = 'md', showNumber = false, className = '' }) => {
  const sizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={i} className={`${sizes[size]} text-yellow-400`} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <FaStar className={`${sizes[size]} text-gray-300`} />
          <FaStar
            className={`${sizes[size]} text-yellow-400 absolute top-0 left-0 overflow-hidden`}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaStar key={i} className={`${sizes[size]} text-gray-300`} />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Rating;


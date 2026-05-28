import React from 'react';

const Card = ({ children, className = '', onClick, hover = false }) => {
  const baseStyles = 'bg-white rounded-lg shadow-md p-6';
  const hoverStyles = hover ? 'transition-shadow duration-200 hover:shadow-lg cursor-pointer' : '';
  
  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;


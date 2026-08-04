import React from 'react';

/**
 * Reusable Card Component.
 * Surface-colored (#FFFFFF) container on top of background (#EEEEEE).
 */
const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg shadow-sm p-5 transition-shadow hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

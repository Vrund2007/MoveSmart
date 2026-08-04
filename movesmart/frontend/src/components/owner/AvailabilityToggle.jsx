import React from 'react';

/**
 * AvailabilityToggle Component — Toggle property availability status.
 */
const AvailabilityToggle = ({ isAvailable = true, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
        isAvailable ? 'bg-green-50 text-success border-green-200' : 'bg-gray-100 text-text-secondary border-gray-300'
      }`}
    >
      {isAvailable ? 'Available' : 'Unavailable'}
    </button>
  );
};

export default AvailabilityToggle;

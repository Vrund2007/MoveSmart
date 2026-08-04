import React from 'react';

/**
 * Reusable Error Banner / Alert Component.
 */
const ErrorComponent = ({ message = 'An error occurred.', onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-error/20 rounded-md p-4 flex items-center justify-between text-error ${className}`}>
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-semibold underline hover:text-red-700 transition-colors ml-4"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorComponent;

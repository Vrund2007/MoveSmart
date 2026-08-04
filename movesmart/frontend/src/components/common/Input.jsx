import React from 'react';

/**
 * Reusable Form Input Component with label and error state.
 */
const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`bg-surface border ${
          error ? 'border-error ring-1 ring-error' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
        } rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-colors`}
        {...props}
      />
      {error && <span className="text-xs text-error mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;

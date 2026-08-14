import React, { useState, useEffect, useRef } from 'react';

/**
 * SearchableSelect Component
 * Replaces standard HTML dropdown <select> with an interactive search bar + autocomplete suggestions dropdown.
 */
export default function SearchableSelect({
  options = [],
  value = '',
  onChange,
  placeholder = 'Type to search properties...',
  required = false,
  className = '',
  error = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Sync search term with selected option label when value changes
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.title ? `${selectedOption.title} (${selectedOption.locality || ''})` : selectedOption.label || '');
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, selectedOption]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedOption) {
          setSearchTerm(selectedOption.title ? `${selectedOption.title} (${selectedOption.locality || ''})` : selectedOption.label || '');
        } else if (!value) {
          setSearchTerm('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption, value]);

  // Filter options based on user input
  const filteredOptions = options.filter((opt) => {
    const currentDisplayLabel = selectedOption
      ? (selectedOption.title ? `${selectedOption.title} (${selectedOption.locality || ''})` : selectedOption.label || '')
      : '';

    if (!searchTerm.trim() || (selectedOption && searchTerm === currentDisplayLabel)) {
      return true;
    }
    const query = searchTerm.toLowerCase();
    const titleMatch = opt.title ? opt.title.toLowerCase().includes(query) : false;
    const localityMatch = opt.locality ? opt.locality.toLowerCase().includes(query) : false;
    const labelMatch = opt.label ? opt.label.toLowerCase().includes(query) : false;
    const priceMatch = opt.price ? String(opt.price).includes(query) : false;
    return titleMatch || localityMatch || labelMatch || priceMatch;
  });

  const handleSelect = (option) => {
    onChange(option.value);
    setSearchTerm(option.title ? `${option.title} (${option.locality || ''})` : option.label || '');
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (value) {
      onChange('');
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for HTML form validation */}
      <input
        type="text"
        tabIndex={-1}
        className="opacity-0 absolute inset-0 h-0 w-0 pointer-events-none"
        required={required}
        value={value}
        onChange={() => {}}
        onInvalid={(e) => {
          e.target.setCustomValidity('Please select a property from the suggestions.');
        }}
        onInput={(e) => {
          e.target.setCustomValidity('');
        }}
      />

      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3 text-text-secondary pointer-events-none flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-9 pr-10 py-2.5 bg-surface border ${
            error ? 'border-error ring-1 ring-error' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
          } rounded-lg text-xs text-text-primary placeholder:text-text-secondary outline-none transition-all shadow-sm`}
        />

        {/* Action icons (Clear & Dropdown Toggle) */}
        <div className="absolute right-3 flex items-center gap-1.5 text-text-secondary">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="hover:text-text-primary p-0.5 rounded-full hover:bg-black/5 transition-colors"
              title="Clear selection"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="hover:text-text-primary p-0.5 rounded transition-transform"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-border/50 animate-in fade-in duration-150">
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-secondary font-medium">
              🔍 No matching properties found{searchTerm ? ` for "${searchTerm}"` : ''}.
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-surface text-text-primary'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold truncate text-text-primary">
                      {opt.title || opt.label}
                    </span>
                    {(opt.locality || opt.price) && (
                      <span className="text-[11px] text-text-secondary mt-0.5 truncate flex items-center gap-1.5">
                        {opt.locality && <span>📍 {opt.locality}</span>}
                        {opt.locality && opt.price && <span className="text-border">•</span>}
                        {opt.price && <span className="font-bold text-emerald-600">₹{Number(opt.price).toLocaleString()}</span>}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

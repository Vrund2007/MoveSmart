// src/components/common/InteractiveLocationPicker.jsx — Geoapify + Leaflet Interactive Location Picker (Ahmedabad Regional Filter)
import React, { useEffect, useRef, useState, useCallback } from 'react';

const GEOAPIFY_API_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEOAPIFY_API_KEY)
  ? import.meta.env.VITE_GEOAPIFY_API_KEY
  : (typeof process !== 'undefined' && process.env && process.env.REACT_APP_GEOAPIFY_API_KEY)
  ? process.env.REACT_APP_GEOAPIFY_API_KEY
  : '';
const AHMEDABAD_CENTER = { lat: 23.0225, lng: 72.5714 };

// Ahmedabad Commercial Tech Hubs & Major Landmarks Knowledge Base
const AHMEDABAD_COMMERCIAL_HUBS = [
  { name: 'TCS Garima Park', formatted: 'TCS Garima Park, IT Park, Infocity, Gandhinagar, Gujarat 382007', lat: 23.1895, lon: 72.6312 },
  { name: 'TCS GIFT City', formatted: 'TCS GIFT City, SEZ Tower, GIFT City, Gandhinagar, Gujarat 382355', lat: 23.1567, lon: 72.6732 },
  { name: 'Adani Corporate House', formatted: 'Adani Corporate House, Shantigram, SG Highway, Ahmedabad, Gujarat 382421', lat: 23.1189, lon: 72.5389 },
  { name: 'Mindtree Ahmedabad', formatted: 'Mindtree Technology Center, Prahladnagar, SG Highway, Ahmedabad, Gujarat 380015', lat: 23.0123, lon: 72.5089 },
  { name: 'Sanand Industrial Estate', formatted: 'GIDC Sanand Industrial Estate, Sanand, Ahmedabad, Gujarat 382110', lat: 22.9856, lon: 72.3789 },
  { name: 'C.G. Road Commercial Center', formatted: 'C.G. Road Shopping & Financial Hub, Navrangpura, Ahmedabad, Gujarat 380009', lat: 23.0312, lon: 72.5589 },
  { name: 'SG Highway IT Corridor', formatted: 'SG Highway Commercial Hub, Bodakdev, Ahmedabad, Gujarat 380054', lat: 23.0456, lon: 72.5234 },
];

// Dynamically load Leaflet CSS & JS
function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  } else {
    const timer = setInterval(() => {
      if (window.L) {
        clearInterval(timer);
        callback();
      }
    }, 100);
  }
}

export default function InteractiveLocationPicker({ 
  value, 
  onChange, 
  label = "Select Office / Work Location",
  showSaveButton = true,
  saveButtonLabel = "💾 Save Office Location"
}) {
  const containerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const [addressText, setAddressText] = useState(value || '');
  const [selectedCoords, setSelectedCoords] = useState(AHMEDABAD_CENTER);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close suggestions dropdown when clicking or touching outside the component, or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Sync addressText state when value prop updates from parent (e.g. on profile load or tab switch)
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setAddressText(value);
    }
  }, [value]);


  // Geoapify Reverse Geocoding API (Task 1: Pin Drop -> Address)
  const reverseGeocodeGeoapify = useCallback(async (lat, lon) => {
    try {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        const formattedAddress = item.formatted || item.address_line1 || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setAddressText(formattedAddress);
        if (onChange) onChange(formattedAddress, { lat, lng: lon });
      }
    } catch (err) {
      console.error("Geoapify Reverse Geocoding failed:", err);
    }
  }, [onChange]);

  // Geoapify Autocomplete API strictly filtered to Ahmedabad regional bounding box (72.30, 22.80) to (72.95, 23.35)
  const fetchAutocompleteSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      // Geoapify Bounding Box Filter for Ahmedabad Metropolitan Region
      const bbox = '72.30,22.80,72.95,23.35';
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=rect:${bbox}&apiKey=${GEOAPIFY_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      let apiMapped = [];
      if (data.features && data.features.length > 0) {
        apiMapped = data.features
          .filter(f => {
            const p = f.properties;
            const state = (p.state || '').toLowerCase();
            const formatted = (p.formatted || '').toLowerCase();
            return state.includes('gujarat') || formatted.includes('ahmedabad') || formatted.includes('gandhinagar') || formatted.includes('india');
          })
          .map((f) => ({
            name: f.properties.name || f.properties.street || f.properties.address_line1 || f.properties.city,
            formatted: f.properties.formatted,
            address_line1: f.properties.address_line1 || f.properties.name,
            address_line2: f.properties.address_line2 || `${f.properties.city || ''}, Gujarat`,
            lat: f.properties.lat,
            lon: f.properties.lon,
          }));
      }

      // Check local Ahmedabad hub matches (e.g. TCS, Adani, Mindtree, GIFT City)
      const qClean = query.trim().toLowerCase();
      const localMatches = AHMEDABAD_COMMERCIAL_HUBS.filter(
        h => h.name.toLowerCase().includes(qClean) || h.formatted.toLowerCase().includes(qClean)
      ).map(h => ({
        name: h.name,
        formatted: h.formatted,
        address_line1: h.name,
        address_line2: h.formatted,
        lat: h.lat,
        lon: h.lon,
      }));

      // Combine local commercial hub matches first + API bounding box results
      const combined = [...localMatches, ...apiMapped];
      const uniqueResults = [];
      const seen = new Set();
      for (const item of combined) {
        if (!seen.has(item.formatted)) {
          seen.add(item.formatted);
          uniqueResults.push(item);
        }
      }

      if (uniqueResults.length > 0) {
        setSuggestions(uniqueResults.slice(0, 8));
        setShowDropdown(true);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    } catch (err) {
      console.error("Geoapify Autocomplete failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setAddressText(val);
    if (onChange) onChange(val, selectedCoords);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(val);
    }, 250);
  };

  const handleSelectSuggestion = (place) => {
    const { lat, lon, formatted } = place;
    setAddressText(formatted);
    setSelectedCoords({ lat, lng: lon });
    setShowDropdown(false);

    if (mapInstanceRef.current && markerInstanceRef.current) {
      const newPos = [lat, lon];
      mapInstanceRef.current.setView(newPos, 16);
      markerInstanceRef.current.setLatLng(newPos);
    }

    if (onChange) onChange(formatted, { lat, lng: lon });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    loadLeaflet(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = window.L;
      const map = L.map(mapContainerRef.current, {
        center: [AHMEDABAD_CENTER.lat, AHMEDABAD_CENTER.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom Red Pin Marker Icon
      const customIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `<div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: translate(-50%, -100%);">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([AHMEDABAD_CENTER.lat, AHMEDABAD_CENTER.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Handle Pin Drag Event
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setSelectedCoords({ lat: position.lat, lng: position.lng });
        reverseGeocodeGeoapify(position.lat, position.lng);
      });

      // Handle Map Click Event
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });
        reverseGeocodeGeoapify(lat, lng);
      });
    });
  }, [reverseGeocodeGeoapify]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setSelectedCoords({ lat, lng: lon });

          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 16);
            markerInstanceRef.current.setLatLng([lat, lon]);
          }

          reverseGeocodeGeoapify(lat, lon);
        },
        () => alert('Location access denied.')
      );
    }
  };

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSaveOfficeClick = () => {
    if (onChange) {
      onChange(addressText, selectedCoords);
    }
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 4000);
  };

  return (
    <div ref={containerRef} className="space-y-2 font-sans text-xs relative">
      <div className="flex justify-between items-center">
        <label className="font-bold text-text-primary block">{label}</label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          🎯 Use My Live Location
        </button>
      </div>

      {/* Real-Time Autocomplete Search Bar & Save Button */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={addressText}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowDropdown(false);
            }}
            placeholder="Search office, company, building name or street in Ahmedabad (e.g. TCS, Adani, GIFT City)..."
            className="w-full bg-white border border-border rounded-lg p-2.5 pl-8 text-xs text-text-primary outline-none focus:border-primary shadow-sm"
            autoComplete="off"
          />
          <span className="absolute left-2.5 top-2.5 text-xs text-text-secondary">
            {isSearching ? '⏳' : '🔍'}
          </span>

          {/* Real-time Autocomplete Dropdown List */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-xl z-[99999] max-h-60 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start gap-2.5 text-left"
                >
                  <span className="text-sm mt-0.5">🏢</span>
                  <div>
                    <div className="font-bold text-text-primary text-xs">{item.name || item.address_line1}</div>
                    <div className="text-[10px] text-text-secondary">{item.formatted}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showSaveButton && (
          <button
            type="button"
            onClick={handleSaveOfficeClick}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95"
          >
            {saveButtonLabel}
          </button>
        )}
      </div>

      {savedNotification && showSaveButton && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
          <span>✓</span>
          <span>Location saved! Area recommendations & commute calculator updated.</span>
        </div>
      )}

      {/* Interactive Map Canvas (OpenStreetMap + Leaflet) */}
      <div className="h-60 rounded-xl overflow-hidden border border-border relative bg-gray-100 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold text-text-primary shadow-md z-[1000] pointer-events-none">
          📍 Pin Coordinates: {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
        </div>
      </div>

      <p className="text-[10px] text-text-secondary">
        {showSaveButton 
          ? "💡 Search or drag the pin 📍 then click Save Office Location to set your office location." 
          : "💡 Search or drag the map pin 📍 to select your starting origin location."}
      </p>
    </div>
  );
}



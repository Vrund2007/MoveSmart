import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { MapPinIcon, ArrowLeftIcon } from '../common/Icons';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Luxury 3 BHK Penthouse with Private Terrace',
    locality: 'Bodakdev, Ahmedabad',
    price: '₹45,000 / mo',
    tag: 'Verified Premium',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1400&q=80',
    description: 'High-end furnished residency with panoramic city views, modern amenities, and 24/7 security.',
  },
  {
    id: 2,
    title: 'Modern Smart Apartment near SG Highway Corridor',
    locality: 'Satellite, Ahmedabad',
    price: '₹32,000 / mo',
    tag: 'Top Recommended',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80',
    description: 'Eco-friendly gated community with clubhouse, swimming pool, and rapid transit access.',
  },
  {
    id: 3,
    title: 'Contemporary Villa with Landscaped Garden',
    locality: 'Thaltej, Ahmedabad',
    price: '₹65,000 / mo',
    tag: 'Exclusive Listing',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80',
    description: 'Spacious 4 BHK independent duplex villa located in Ahmedabad West prime residential zone.',
  },
  {
    id: 4,
    title: 'Designer Fully-Furnished 2 BHK Suite',
    locality: 'South Bopal, Ahmedabad',
    price: '₹24,000 / mo',
    tag: 'Best Value',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80',
    description: 'Perfect for working professionals and small families seeking peaceful suburban living.',
  },
];

export default function HubHeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
      }, 4500);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl border border-white/10 group font-sans"
    >
      {/* Background Image Carousel with Smooth Fade */}
      {HERO_SLIDES.map((item, idx) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
          />
          {/* Gradient Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/20" />
        </div>
      ))}

      {/* Slide Content Overlay */}
      <div className="relative z-20 h-full p-5 sm:p-8 flex flex-col justify-between text-white">
        {/* Top Badges */}
        <div className="flex justify-between items-center gap-2">
          <span className="bg-[#00ADB5] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg backdrop-blur-md">
            {slide.tag}
          </span>
          <div className="bg-slate-950/70 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-bold text-teal-300 flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-teal-300" />
            <span>{slide.locality}</span>
          </div>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-lg sm:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-md">
            {slide.title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed opacity-95">
            {slide.description}
          </p>

          <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl">
              <span className="text-[9px] sm:text-[10px] uppercase text-gray-300 font-extrabold block">Starting Rent</span>
              <span className="text-sm sm:text-base font-black text-white">{slide.price}</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard?tab=browse')}
              className="bg-[#00ADB5] hover:bg-teal-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-lg border-0 transition-all text-xs"
            >
              Browse All Properties
            </Button>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex justify-between items-center pt-2">
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'w-8 bg-[#00ADB5]' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
              className="w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold hover:bg-[#00ADB5] transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
              className="w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold hover:bg-[#00ADB5] transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

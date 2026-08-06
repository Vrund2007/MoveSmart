// frontend/src/components/sections/VerifiedListings.jsx
// Section 5 — Pinned Horizontal Sideways Scroll Experience
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Badge from '../common/Badge';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const SAMPLE_LISTINGS = [
  {
    id: 'l1',
    title: 'Greenwood Residency #402',
    locality: 'Prahlad Nagar, Ahmedabad',
    price: '₹28,000',
    period: '/ month',
    bhk: '3 BHK',
    commute: '14 min to CBD',
    badgeVariant: 'admin_verified',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'l2',
    title: 'Skyline Towers #1201',
    locality: 'SG Highway, Ahmedabad',
    price: '₹35,000',
    period: '/ month',
    bhk: '3 BHK',
    commute: '8 min to Metro',
    badgeVariant: 'ai_scored',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'l3',
    title: 'Riverfront Executive Suites',
    locality: 'Ashram Road, Ahmedabad',
    price: '₹42,000',
    period: '/ month',
    bhk: '4 BHK Luxury',
    commute: '5 min to Financial District',
    badgeVariant: 'zero_deposit',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'l4',
    title: 'Urban Nest Apartments',
    locality: 'Bodakdev, Ahmedabad',
    price: '₹24,000',
    period: '/ month',
    bhk: '2 BHK',
    commute: '18 min to Tech Park',
    badgeVariant: 'verified_owner',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'l5',
    title: 'Harmony Gardens #204',
    locality: 'Satellite, Ahmedabad',
    price: '₹31,000',
    period: '/ month',
    bhk: '3 BHK',
    commute: '10 min to Metro',
    badgeVariant: 'admin_verified',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  },
];

export default function VerifiedListings() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  // Pinned Horizontal Sideways Scroll Animation
  useGSAP(() => {
    if (prefersReducedMotion || !trackRef.current) return;

    const totalCards = SAMPLE_LISTINGS.length;

    gsap.to(trackRef.current, {
      xPercent: -72 * (totalCards - 1) / totalCards,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 1,
        start: 'top top',
        end: () => `+=${trackRef.current.offsetWidth}`,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      id="verified-listings"
      ref={sectionRef}
      className="relative bg-[#EEEEEE]/90 py-20 px-6 md:px-16 overflow-hidden min-h-screen flex flex-col justify-center border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[#00ADB5] font-bold text-sm uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              Horizontal Sideways Scroll Section
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight mt-1 mb-2 font-['Plus_Jakarta_Sans']">
              Verified Listings Marketplace
            </h2>
            <p className="text-[#393E46] text-base font-medium max-w-xl">
              Scroll down to navigate sideways through pre-audited properties with ML anomaly risk scores.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#00ADB5] bg-white px-4 py-2 rounded-full shadow-xs border border-black/5">
            <span>Scroll Down to Pan Sideways</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Sideways Sliding Track */}
      <div className="w-full overflow-x-auto md:overflow-hidden pb-4 md:pb-0">
        <div
          ref={trackRef}
          className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 md:px-16"
          style={{ willChange: 'transform' }}
        >
          {SAMPLE_LISTINGS.map((item, idx) => (
            <div
              key={item.id}
              className="interactive-hover group w-[85vw] max-w-[360px] md:w-[420px] flex-shrink-0 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden border border-white shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-gray-200">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant={item.badgeVariant} />
                </div>
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white font-extrabold text-xs font-['Plus_Jakarta_Sans']">
                  0{idx + 1} / 05
                </div>
                <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-white/95 text-[#222831] font-extrabold text-xs font-['Plus_Jakarta_Sans'] shadow-sm">
                  {item.bhk}
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xl text-[#222831] mb-1.5 font-['Plus_Jakarta_Sans'] group-hover:text-[#00ADB5] transition-colors duration-200">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#393E46] font-medium mb-5">
                    <MapPin size={14} color="#00ADB5" />
                    <span>{item.locality}</span>
                  </div>
                </div>

                <div className="border-t border-black/5 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#008C93] bg-[#00ADB5]/10 px-3 py-1.5 rounded-xl">
                    <Navigation size={13} />
                    <span>{item.commute}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-xl text-[#222831] font-['Plus_Jakarta_Sans'] tabular-nums">
                      {item.price}
                    </span>
                    <span className="text-xs text-[#393E46] font-medium">{item.period}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// components/hero/CityHero.jsx
// Refactored Hero component using persistent 3D canvas background from Landing.jsx
import React, { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import {
  MapPin, Calculator, ShieldCheck,
  Navigation, Star, ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const FEATURES = [
  { icon: MapPin,      title: 'Smart Neighborhoods', label: 'AI-ranked localities' },
  { icon: Navigation,  title: 'Commute Insights',    label: 'Real travel times' },
  { icon: Calculator,  title: 'Cost Calculator',     label: 'Monthly cost estimates' },
  { icon: ShieldCheck, title: 'Verified Homes',      label: 'Admin-reviewed listings' },
];

const FLOATING_CARDS = [
  {
    id: 'cbd',
    icon: MapPin,
    title: 'Central Business District',
    value: '12 min commute',
    detail: 'Recommended locality',
    valueColor: '#00ADB5',
    style: { top: '140px', right: '60px' },
    delay: 100,
  },
  {
    id: 'greenwood',
    icon: Star,
    title: 'Greenwood Apartments',
    value: '₹22K - ₹35K / month',
    detail: 'Best Match property',
    valueColor: '#22C55E',
    style: { bottom: '160px', right: '80px' },
    delay: 200,
  },
];

export function HeroNavbar({ scrolled }) {
  const [activeTab, setActiveTab] = useState('Home');

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Roles', href: '#choose-role' },
    { label: 'Districts', href: '#horizontal-scroll' },
    { label: 'Trust & Listings', href: '#verified-listings' },
    { label: 'Stats', href: '#statistics' },
  ];

  return (
    <header
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12',
        scrolled ? 'bg-white/85 backdrop-blur-xl shadow-md py-3' : 'bg-transparent',
      ].join(' ')}
    >
      <div className="w-full flex items-center justify-between">
        
        {/* Interactive Logo & Brand */}
        <a
          href="/"
          className="group flex items-center gap-3.5 no-underline transition-transform duration-200 hover:scale-[1.02] interactive-hover"
          aria-label="MoveSmart Homepage"
        >

          <div className="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5] shadow-sm transition-shadow duration-300 group-hover:shadow-md group-hover:shadow-[#00ADB5]/25">
            <img
              src="/smart-Building.png"
              alt="MoveSmart Logo"
              className="w-full h-full rounded-full object-cover bg-white"
            />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#222831] font-['Plus_Jakarta_Sans'] leading-none">
            Move<span className="text-[#00ADB5]">Smart</span>
          </span>
        </a>

        {/* Floating Glass Nav Pill */}
        <nav className="hidden md:flex items-center bg-white/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5 shadow-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.label;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveTab(item.label)}
                className={[
                  'relative px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 interactive-hover',
                  isActive
                    ? 'text-[#222831] bg-white shadow-xs font-bold'
                    : 'text-[#393E46] hover:text-[#222831] hover:bg-black/5',
                ].join(' ')}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <a
            href="/signup"
            className="interactive-hover relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 rounded-full bg-gradient-to-r from-[#00ADB5] to-[#008C93] shadow-md shadow-[#00ADB5]/25 hover:shadow-lg hover:shadow-[#00ADB5]/40 hover:scale-[1.03] active:scale-[0.98]"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function FloatingCard({ card, visible }) {
  const Icon = card.icon;
  return (
    <div
      style={{
        position: 'absolute',
        ...card.style,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px',
        padding: '16px 20px',
        minWidth: '230px',
        maxWidth: '270px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        transition: prefersReducedMotion ? 'none' : 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: prefersReducedMotion ? '0ms' : `${card.delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: `${card.valueColor}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={13} color={card.valueColor} style={{ flexShrink: 0 }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#222831', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {card.title}
        </span>
      </div>
      <p style={{ fontWeight: 800, fontSize: '14px', color: card.valueColor, margin: '2px 0', fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}>
        {card.value}
      </p>
      <p style={{ fontSize: '11px', fontWeight: 500, color: '#393E46', margin: 0 }}>{card.detail}</p>
    </div>
  );
}

export default function CityHero({ modelLoaded = true }) {
  const heroRef = useRef(null);
  const headlineRef = useRef(null);
  const ctaBtnRef = useRef(null);

  // SplitText Line Reveal Setup
  useGSAP(() => {
    if (prefersReducedMotion || !headlineRef.current) return;

    try {
      const split = new SplitText(headlineRef.current, {
        type: 'lines',
        linesClass: 'split-line-wrap',
      });
      split.lines.forEach((line) => {
        line.innerHTML = `<span class="split-line-child">${line.innerHTML}</span>`;
      });
      const children = headlineRef.current.querySelectorAll('.split-line-child');
      gsap.fromTo(
        children,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.15,
        }
      );
    } catch (err) {
      gsap.from(headlineRef.current, { opacity: 0, y: 20, duration: 0.8 });
    }
  }, { scope: heroRef });

  // Magnetic Button Mouse Interaction
  const handleCtaMouseMove = (e) => {
    if (prefersReducedMotion || !ctaBtnRef.current) return;
    const rect = ctaBtnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.28;
    const dy = (e.clientY - centerY) * 0.28;
    gsap.to(ctaBtnRef.current, {
      x: dx,
      y: dy,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleCtaMouseLeave = () => {
    if (prefersReducedMotion || !ctaBtnRef.current) return;
    gsap.to(ctaBtnRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-transparent w-full"
      style={{ minHeight: '100vh' }}
    >
      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:block absolute inset-0">
        {/* Soft Left Gradient Overlay for Readability */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(238,238,238,0.92) 0%, rgba(238,238,238,0.6) 34%, transparent 66%)',
          }}
        />

        {/* Hero Content Left Column */}
        <div className="absolute z-20 top-1/2 -translate-y-1/2 left-16 max-w-[480px]">
          {/* Headline */}
          <h1
            ref={headlineRef}
            className="font-extrabold text-[#222831] leading-[1.08] tracking-tight font-['Plus_Jakarta_Sans'] mb-6"
            style={{ fontSize: 'clamp(2.75rem, 3.8vw, 3.75rem)' }}
          >
            Find Your <span className="bg-gradient-to-r from-[#222831] via-[#00ADB5] to-[#222831] bg-clip-text text-transparent">Perfect City</span>, Not Just a House.
          </h1>

          {/* Subparagraph */}
          <p className="text-[#393E46] leading-relaxed font-medium text-[1.0625rem] mb-8 max-w-[420px]">
            Your AI-powered city companion for finding the perfect home, smartest commute, and the best life in a new city.
          </p>

          {/* Magnetic CTA Button */}
          <div className="mb-10 flex items-center gap-4">
            <a
              ref={ctaBtnRef}
              href="/signup"
              onMouseMove={handleCtaMouseMove}
              onMouseLeave={handleCtaMouseLeave}
              className="interactive-hover magnetic-btn-glow inline-flex items-center gap-2.5 bg-[#00ADB5] text-white font-bold rounded-xl shadow-lg shadow-[#00ADB5]/25 hover:shadow-xl hover:shadow-[#00ADB5]/35 hover:bg-[#00969d] px-8 py-4 text-base transition-all duration-200 no-underline"
            >
              <span>Start Planning</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
          </div>

          {/* 2x2 Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="interactive-hover flex items-start gap-3 p-2.5 rounded-xl bg-white/75 backdrop-blur-xs border border-white/90 shadow-sm transition-all duration-200 hover:bg-white hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-[#00ADB5]/12 flex items-center justify-center">
                    <Icon size={16} color="#00ADB5" />
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-[#222831] m-0 font-['Plus_Jakarta_Sans']">
                      {feat.title}
                    </p>
                    <p className="text-[11px] font-medium text-[#393E46] m-0">{feat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Info Cards */}
        {FLOATING_CARDS.map((card) => (
          <FloatingCard key={card.id} card={card} visible={modelLoaded} />
        ))}
      </div>

      {/* ── MOBILE LAYOUT ── */}
      <div className="flex md:hidden flex-col min-h-screen pt-24 px-6 pb-8">
        <h1 className="font-extrabold text-3xl text-[#222831] leading-tight mb-4 font-['Plus_Jakarta_Sans']">
          Find Your <span className="text-[#00ADB5]">Perfect City</span>, Not Just a House.
        </h1>
        <p className="text-[#393E46] text-base leading-relaxed mb-6 font-medium">
          Your AI-powered city companion for finding the perfect home, smartest commute, and the best life.
        </p>
        <a
          href="/signup"
          className="interactive-hover block text-center bg-[#00ADB5] text-white font-bold py-3.5 px-6 rounded-xl mb-8 shadow-md shadow-[#00ADB5]/25 text-base no-underline"
        >
          Start Planning &rarr;
        </a>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/80 border border-black/5">
                <div className="w-7 h-7 rounded bg-[#00ADB5]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} color="#00ADB5" />
                </div>
                <div>
                  <p className="font-bold text-xs text-[#222831] m-0">{feat.title}</p>
                  <p className="text-[10px] text-[#393E46] m-0">{feat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

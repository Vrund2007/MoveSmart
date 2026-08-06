// frontend/src/components/sections/HorizontalScrollytelling.jsx
// Section 4 — Full Pinned Horizontal / Sideways Scroll Experience
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home, Briefcase, Bus, ShieldCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const PANELS = [
  {
    id: 'p1',
    tag: 'Pillar 01',
    title: 'Area Intelligence Overview',
    score: '94/100 Overall',
    description:
      'MoveSmart evaluates every locality across four core city pillars so you find a neighborhood tailored to your life.',
    icon: ShieldCheck,
    accent: '#00ADB5',
    details: ['Multi-vector AI ranking', 'Real-time commute calculations', 'Scam-free property auditing'],
  },
  {
    id: 'p2',
    tag: 'Pillar 02',
    title: 'Residential & Safety',
    score: '94/100',
    description:
      'Low crime rates, quiet residential pockets, green parks, and family-friendly apartment complexes.',
    icon: Home,
    accent: '#22C55E',
    details: ['Greenwood Residency', 'Bodakdev Green Belt', 'Prahlad Nagar Enclave'],
  },
  {
    id: 'p3',
    tag: 'Pillar 03',
    title: 'Commercial & Tech Hubs',
    score: '91/100',
    description:
      'Direct access to major IT parks, financial districts, co-working hubs, and startup incubators.',
    icon: Briefcase,
    accent: '#00ADB5',
    details: ['SG Highway Tech Park', 'CBD Financial Towers', 'Mindspace Work Hub'],
  },
  {
    id: 'p4',
    tag: 'Pillar 04',
    title: 'Transit & Lifestyle',
    score: '96/100',
    description:
      'Under 10 mins to Metro stations, BRTS express corridors, dining districts, and healthcare centers.',
    icon: Bus,
    accent: '#22C55E',
    details: ['Metro Line 1 — 4 min', 'BRTS Terminal — 3 min', 'Lifestyle Square — 6 min'],
  },
];

export default function HorizontalScrollytelling() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion || !trackRef.current || !sectionRef.current) return;

    // Calculate total horizontal width to slide
    const trackWidth = trackRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollAmount = trackWidth - viewportWidth + 120;

    gsap.to(trackRef.current, {
      x: -scrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${scrollAmount * 1.2}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      id="horizontal-scroll"
      ref={sectionRef}
      className="relative bg-[#EEEEEE]/90 min-h-screen overflow-hidden flex flex-col justify-center py-16 border-t border-b border-black/5"
    >
      {/* Section Title Header */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-16 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[#00ADB5] font-bold text-sm uppercase tracking-wider font-['Plus_Jakarta_Sans']">
            Interactive Sideways Fly-Through
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight mt-1 font-['Plus_Jakarta_Sans']">
            The Four City Pillars
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#00ADB5] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-black/5 shadow-xs">
          <span>← Scroll down to move horizontally across districts →</span>
        </div>
      </div>

      {/* Pinned Horizontal Sliding Track */}
      <div className="w-full overflow-x-auto md:overflow-hidden pb-4 md:pb-0">
        <div
          ref={trackRef}
          className="inline-flex gap-4 sm:gap-8 px-4 sm:px-6 md:px-16 items-center"
          style={{ willChange: 'transform' }}
        >
          {PANELS.map((panel, idx) => {
            const Icon = panel.icon;
            return (
              <div
                key={panel.id}
                className="interactive-hover group w-[85vw] max-w-[340px] md:w-[480px] flex-shrink-0 bg-white/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 shadow-xl transition-all duration-300 hover:bg-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${panel.accent}15` }}
                    >
                      <Icon size={22} color={panel.accent} />
                    </div>
                    <span className="text-xs font-bold text-[#393E46] uppercase font-['Plus_Jakarta_Sans']">
                      {panel.tag}
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-[#00ADB5] bg-[#00ADB5]/10 px-3 py-1 rounded-full font-['Plus_Jakarta_Sans'] tabular-nums">
                    {panel.score}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-[#222831] mb-3 font-['Plus_Jakarta_Sans'] group-hover:text-[#00ADB5] transition-colors">
                  {panel.title}
                </h3>

                <p className="text-[#393E46] text-sm md:text-base font-medium leading-relaxed mb-6">
                  {panel.description}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-black/5">
                  {panel.details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#222831]">
                      <span className="w-2 h-2 rounded-full bg-[#00ADB5]" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

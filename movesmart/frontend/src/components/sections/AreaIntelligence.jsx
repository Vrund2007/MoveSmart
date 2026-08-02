// frontend/src/components/sections/AreaIntelligence.jsx
// Section 4 — Area Intelligence showcasing the 4 scoring pillars with Parallax & SVG Draw animation
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Home, Briefcase, Coffee, Bus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const DISTRICT_PILLARS = [
  {
    id: 'res',
    name: 'Residential Density',
    score: '94/100',
    desc: 'Housing supply, safety metrics, & quiet residential pockets.',
    icon: Home,
    color: '#00ADB5',
  },
  {
    id: 'biz',
    name: 'Commercial & Tech Hubs',
    score: '91/100',
    desc: 'Proximity to IT parks, office complexes, & co-working centers.',
    icon: Briefcase,
    color: '#22C55E',
  },
  {
    id: 'life',
    name: 'Lifestyle & Amenities',
    score: '88/100',
    desc: 'Parks, dining, cafes, healthcare facilities, & shopping.',
    icon: Coffee,
    color: '#00ADB5',
  },
  {
    id: 'transit',
    name: 'Transit Connectivity',
    score: '96/100',
    desc: 'Metro stations, expressways, BRTS routes, & highway links.',
    icon: Bus,
    color: '#22C55E',
  },
];

export default function AreaIntelligence() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const layerBackRef = useRef(null);
  const layerMidRef = useRef(null);
  const layerFrontRef = useRef(null);
  const svgPathRef = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // 1. Word Reveal for Headline
    if (headlineRef.current) {
      const text = headlineRef.current.innerText;
      const words = text.split(' ');
      headlineRef.current.innerHTML = words
        .map((w) => `<span class="inline-block opacity-0 translate-y-3 mr-2">${w}</span>`)
        .join('');

      const wordSpans = headlineRef.current.querySelectorAll('span');
      gsap.to(wordSpans, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: headlineRef.current,
          start: 'top 85%',
        },
      });
    }

    // 2. Parallax Depth Layers (scrubbed on scroll)
    gsap.to(layerBackRef.current, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    gsap.to(layerFrontRef.current, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // 3. SVG Path Draw Animation
    if (svgPathRef.current) {
      try {
        gsap.fromTo(
          svgPathRef.current,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        );
      } catch (e) {
        // Fallback strokeDashoffset animation
        const length = svgPathRef.current.getTotalLength ? svgPathRef.current.getTotalLength() : 600;
        gsap.fromTo(
          svgPathRef.current,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        );
      }
    }
  }, { scope: sectionRef });

  return (
    <section
      id="area-intelligence"
      ref={sectionRef}
      className="py-24 px-6 md:px-16 bg-[#EEEEEE]/90 relative overflow-hidden border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-[#00ADB5] font-bold text-sm uppercase tracking-wider font-['Plus_Jakarta_Sans']">
            Scoring Engine
          </span>
          <h2
            ref={headlineRef}
            className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight mt-1 mb-4 font-['Plus_Jakarta_Sans']"
          >
            Area Intelligence: The Four City Pillars
          </h2>
          <p className="text-[#393E46] text-base md:text-lg font-medium leading-relaxed">
            MoveSmart evaluates every locality across four distinct vectors so you can choose a neighborhood tailored to your lifestyle.
          </p>
        </div>

        {/* Multi-Layer Parallax Visual & 4-Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Layered Graphic */}
          <div className="lg:col-span-6 relative h-[380px] md:h-[460px] rounded-3xl bg-white/70 backdrop-blur-xl p-6 border border-white/90 shadow-xl overflow-hidden flex items-center justify-center">
            {/* Layer 1: Background Grid & Map Dots */}
            <div
              ref={layerBackRef}
              className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#222831_1px,transparent_1px)] [background-size:16px_16px]"
            />

            {/* Layer 2: Connecting SVG Path Graphic */}
            <div ref={layerMidRef} className="absolute inset-0 flex items-center justify-center p-8">
              <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                {/* Connecting Quadrant Lines */}
                <path
                  ref={svgPathRef}
                  d="M 50 150 Q 200 40 350 150 T 200 260 Z"
                  stroke="#00ADB5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="6 6"
                />
                <circle cx="200" cy="150" r="8" fill="#00ADB5" className="animate-ping opacity-75" />
                <circle cx="200" cy="150" r="14" fill="#00ADB5" opacity="0.3" />
                <circle cx="200" cy="150" r="5" fill="#222831" />
              </svg>
            </div>

            {/* Layer 3: Foreground Floating Score Nodes */}
            <div ref={layerFrontRef} className="relative z-10 w-full grid grid-cols-2 gap-4">
              {DISTRICT_PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white/90 shadow-md border border-white flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `${p.color}15` }}
                      >
                        <Icon size={16} color={p.color} />
                      </div>
                      <span className="text-sm font-extrabold text-[#222831] font-['Plus_Jakarta_Sans'] tabular-nums">
                        {p.score}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-[#222831] font-['Plus_Jakarta_Sans']">
                      {p.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 4 Pillars Cards */}
          <div className="lg:col-span-6 space-y-4">
            {DISTRICT_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.id}
                  className="interactive-hover p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md hover:bg-white transition-all duration-200 flex items-start gap-4"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${pillar.color}15` }}
                  >
                    <Icon size={20} color={pillar.color} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-extrabold text-base text-[#222831] font-['Plus_Jakarta_Sans']">
                        {pillar.name}
                      </h4>
                      <span className="text-xs font-extrabold text-[#00ADB5] px-2.5 py-0.5 rounded-full bg-[#00ADB5]/10 font-['Plus_Jakarta_Sans'] tabular-nums">
                        {pillar.score}
                      </span>
                    </div>
                    <p className="text-xs text-[#393E46] font-medium leading-relaxed m-0">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

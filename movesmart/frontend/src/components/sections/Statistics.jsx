// frontend/src/components/sections/Statistics.jsx
// Section 6 — Statistics Social Proof with animated counters and tabular-nums formatting
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const STATS = [
  {
    id: 'cities',
    value: 12,
    suffix: '+',
    label: 'Major Cities Covered',
    detail: 'Expanding across tier-1 relocation hubs',
  },
  {
    id: 'homes',
    value: 15000,
    suffix: '+',
    label: 'Verified Homes Audited',
    detail: '100% inspected with ML risk scores',
  },
  {
    id: 'relocations',
    value: 98.4,
    suffix: '%',
    decimals: 1,
    label: 'Successful Relocations',
    detail: 'Zero scam reports or hidden fee disputes',
  },
  {
    id: 'rating',
    value: 4.9,
    suffix: ' / 5',
    decimals: 1,
    label: 'Customer Satisfaction',
    detail: 'Across 4,200+ verified tenant reviews',
  },
];

export default function Statistics() {
  const sectionRef = useRef(null);
  const numRefs = useRef([]);

  useGSAP(() => {
    if (prefersReducedMotion) {
      // Direct set for reduced motion
      STATS.forEach((stat, i) => {
        if (numRefs.current[i]) {
          numRefs.current[i].innerText = stat.decimals
            ? stat.value.toFixed(stat.decimals)
            : stat.value.toLocaleString();
        }
      });
      return;
    }

    STATS.forEach((stat, i) => {
      const el = numRefs.current[i];
      if (!el) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: stat.value,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        onUpdate: () => {
          el.innerText = stat.decimals
            ? obj.val.toFixed(stat.decimals)
            : Math.floor(obj.val).toLocaleString();
        },
      });
    });
  }, { scope: sectionRef });

  return (
    <section
      id="statistics"
      ref={sectionRef}
      className="py-20 px-6 md:px-16 bg-[#EEEEEE]/90 border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.id}
              className="p-6 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/90 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline font-extrabold text-4xl md:text-5xl text-[#222831] font-['Outfit','Plus_Jakarta_Sans'] tracking-tight mb-2">
                  <span ref={(el) => (numRefs.current[i] = el)} className="tabular-nums">
                    0
                  </span>
                  <span className="text-[#00ADB5] ml-1">{stat.suffix}</span>
                </div>
                <h3 className="font-extrabold text-base text-[#222831] font-['Plus_Jakarta_Sans'] mb-1">
                  {stat.label}
                </h3>
              </div>
              <p className="text-xs font-medium text-[#393E46] m-0">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

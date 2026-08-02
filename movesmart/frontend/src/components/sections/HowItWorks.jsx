// frontend/src/components/sections/HowItWorks.jsx
// Section 2 — Pinned Scrollytelling walking through product core loop
import React, { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Sliders, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const STEPS = [
  {
    num: '01',
    title: 'Define Your Priorities',
    description:
      'Tell us your target budget, daily office commute locations, preferred lifestyle vibe, and move-in timeline in under 60 seconds.',
    icon: Sliders,
    tag: 'Step 1 — Input',
    metric: '60s setup',
    badgeColor: '#00ADB5',
    cardContent: {
      heading: 'Personalized Preferences',
      items: ['Rent: ₹20k - ₹35k', 'Max commute: 25 mins', 'Vibe: Quiet & Green'],
    },
  },
  {
    num: '02',
    title: 'AI Neighborhood Ranking',
    description:
      'Our multi-vector engine analyzes real-time traffic, transit lines, and local cost-of-living data to score every locality in the city.',
    icon: Cpu,
    tag: 'Step 2 — Intelligence',
    metric: '98.6% match accuracy',
    badgeColor: '#00ADB5',
    cardContent: {
      heading: 'Top Match: Prahlad Nagar',
      items: ['Commute score: 96/100', 'Safety index: 94/100', 'Avg. rent: ₹24,500'],
    },
  },
  {
    num: '03',
    title: 'Explore Audited Listings',
    description:
      'Browse properties pre-audited by our admin team and screened with ML anomaly detection — zero fake photos or hidden broker fees.',
    icon: ShieldCheck,
    tag: 'Step 3 — Trust',
    metric: '100% scam-free guarantee',
    badgeColor: '#22C55E',
    cardContent: {
      heading: 'Greenwood Residency #402',
      items: ['Admin Verified ✓', 'Isolation Forest Risk: 0.0%', 'Zero deposit option'],
    },
  },
  {
    num: '04',
    title: 'Relocate with Certainty',
    description:
      'Book home visits, schedule certified broker tours, or process enterprise HR relocation allowances with end-to-end digital tracking.',
    icon: CheckCircle2,
    tag: 'Step 4 — Move In',
    metric: 'Seamless onboarding',
    badgeColor: '#00ADB5',
    cardContent: {
      heading: 'Digital Move-In Package',
      items: ['Lease agreement generated', 'Key handoff scheduled', 'Relocation complete'],
    },
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    const totalSteps = STEPS.length;

    // Pinning ScrollTrigger
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: `+=${totalSteps * 100}%`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const progress = self.progress;
        // Progress bar fill
        if (progressBarRef.current) {
          gsap.set(progressBarRef.current, { scaleX: progress });
        }
        // Active step indexing (0 to 3)
        const stepIdx = Math.min(
          totalSteps - 1,
          Math.floor(progress * totalSteps)
        );
        setActiveStepIndex(stepIdx);
      },
    });

    return () => st.kill();
  }, { scope: sectionRef });

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-[#EEEEEE]/90 py-20 px-6 md:px-16 overflow-hidden min-h-screen flex flex-col justify-center border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/10 pb-6">
          <div>
            <span className="text-[#00ADB5] font-bold text-sm tracking-wider uppercase font-['Plus_Jakarta_Sans']">
              Scrollytelling Experience
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight mt-1 font-['Plus_Jakarta_Sans']">
              How MoveSmart Works
            </h2>
          </div>
          <p className="text-[#393E46] text-base max-w-md font-medium">
            From smart neighborhood discovery to key handoff — a 4-step data-driven relocation journey.
          </p>
        </div>

        {/* Section Progress Bar */}
        <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden mb-12">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#00ADB5] to-[#22C55E] origin-left transform scale-x-0 transition-transform duration-100 ease-out"
          />
        </div>

        {/* DESKTOP PINNED VIEW */}
        <div ref={containerRef} className="hidden md:grid grid-cols-12 gap-12 items-center min-h-[440px]">
          {/* Left Text Column */}
          <div className="col-span-6 flex flex-col justify-center">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className={[
                    'transition-all duration-500 ease-out',
                    isActive
                      ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto block'
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none hidden',
                  ].join(' ')}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-black/5 mb-4 shadow-xs">
                    <Icon size={14} color={step.badgeColor} />
                    <span className="text-xs font-bold text-[#222831] font-['Plus_Jakarta_Sans']">
                      {step.tag}
                    </span>
                  </div>

                  <h3 className="text-4xl font-extrabold text-[#222831] leading-tight mb-4 font-['Plus_Jakarta_Sans']">
                    <span className="text-[#00ADB5] mr-3">{step.num}.</span>
                    {step.title}
                  </h3>

                  <p className="text-[#393E46] text-lg leading-relaxed mb-6 font-medium max-w-lg">
                    {step.description}
                  </p>

                  <div className="inline-block px-4 py-2 rounded-xl bg-[#00ADB5]/10 border border-[#00ADB5]/20 text-[#008C93] font-bold text-sm font-['Plus_Jakarta_Sans']">
                    {step.metric}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Visual Card Column */}
          <div className="col-span-6 relative flex justify-center items-center">
            {STEPS.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              return (
                <div
                  key={step.num}
                  className={[
                    'w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/80 transition-all duration-500',
                    isActive
                      ? 'opacity-100 scale-100 rotate-0 z-20 pointer-events-auto'
                      : 'opacity-0 scale-90 rotate-2 z-0 pointer-events-none absolute inset-x-0',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#393E46]">
                      {step.cardContent.heading}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00ADB5] animate-pulse" />
                  </div>

                  <div className="space-y-3.5 mb-6">
                    {step.cardContent.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#EEEEEE]/60 border border-black/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#00ADB5]/15 flex items-center justify-center flex-shrink-0 text-[#00ADB5] font-bold text-xs">
                          ✓
                        </div>
                        <span className="text-sm font-semibold text-[#222831]">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#393E46] font-medium pt-2 border-t border-black/5">
                    <span>Step {step.num} of 04</span>
                    <span className="text-[#00ADB5] font-bold">MoveSmart AI Engine</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE FALLBACK GRID */}
        <div className="grid md:hidden grid-cols-1 gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-md border border-white/80"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={18} color={step.badgeColor} />
                  <span className="text-xs font-bold text-[#00ADB5] font-['Plus_Jakarta_Sans']">
                    {step.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#222831] mb-2 font-['Plus_Jakarta_Sans']">
                  {step.num}. {step.title}
                </h3>
                <p className="text-[#393E46] text-sm leading-relaxed font-medium mb-4">
                  {step.description}
                </p>
                <div className="p-3 rounded-xl bg-[#EEEEEE] text-xs font-bold text-[#222831]">
                  {step.cardContent.heading}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

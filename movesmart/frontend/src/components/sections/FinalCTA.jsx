// frontend/src/components/sections/FinalCTA.jsx
// Section 7 — Final CTA with Aurora Mesh Gradient background, SplitText char reveal, and Magnetic CTA button
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowRight, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export default function FinalCTA() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const btnRef = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion || !headlineRef.current) return;

    try {
      const split = new SplitText(headlineRef.current, {
        type: 'chars',
        charsClass: 'inline-block opacity-0 translate-y-4',
      });

      gsap.to(split.chars, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.02,
        ease: 'back.out(1.5)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });
    } catch (e) {
      gsap.from(headlineRef.current, { opacity: 0, y: 20, duration: 0.8 });
    }
  }, { scope: sectionRef });

  const handleMouseMove = (e) => {
    if (prefersReducedMotion || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * 0.3;
    const dy = (e.clientY - centerY) * 0.3;
    gsap.to(btnRef.current, {
      x: dx,
      y: dy,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion || !btnRef.current) return;
    gsap.to(btnRef.current, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative bg-white/35 backdrop-blur-md py-28 px-6 md:px-16 overflow-hidden flex flex-col items-center justify-center text-center border-t border-[#00ADB5]/15 shadow-xs"
    >
      {/* Soft Blurred Gradient Orbs (White to Brand Teal/Cyan Theme) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-[#00ADB5]/25 via-[#00D2DC]/20 to-transparent rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[380px] bg-gradient-to-br from-[#00ADB5]/20 via-[#393E46]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#00ADB5]/30 mb-6 shadow-xs">
          <Sparkles size={15} className="text-[#00ADB5]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#00ADB5] font-['Plus_Jakarta_Sans']">
            Your Next Chapter Begins Here
          </span>
        </div>

        <h2
          ref={headlineRef}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-['Plus_Jakarta_Sans'] text-[#222831] leading-tight"
        >
          Ready to Move with <span className="bg-gradient-to-r from-[#222831] via-[#00ADB5] to-[#222831] bg-clip-text text-transparent">Certainty?</span>
        </h2>

        <p className="text-[#393E46] text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of renters, property owners, certified brokers, and HR teams building the future of AI-powered city relocation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            ref={btnRef}
            href="/login"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="interactive-hover magnetic-btn-glow inline-flex items-center gap-3 bg-[#00ADB5] text-white font-bold rounded-xl shadow-xl shadow-[#00ADB5]/25 hover:bg-[#00969d] px-9 py-4 text-lg transition-all duration-200 no-underline"
          >
            <span>Start Free Trial</span>
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}

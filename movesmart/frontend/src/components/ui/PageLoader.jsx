// frontend/src/components/ui/PageLoader.jsx
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function PageLoader({ onComplete }) {
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsDone(true);
        if (onComplete) onComplete();
      },
    });

    // 1. Initial set
    gsap.set(logoRef.current, { scale: 0.75, opacity: 0, rotation: -10 });
    gsap.set(textRef.current, { y: 15, opacity: 0 });

    // 2. Animate logo & text in (0.5s)
    tl.to(logoRef.current, {
      scale: 1.05,
      opacity: 1,
      rotation: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
    })
      .to(
        textRef.current,
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.25'
      )
      // 3. Subtle pulse (0.3s)
      .to(logoRef.current, {
        scale: 1.0,
        duration: 0.3,
        ease: 'power1.inOut',
      })
      // 4. Wipe away transition (0.4s)
      .to(containerRef.current, {
        opacity: 0,
        scale: 1.04,
        duration: 0.4,
        ease: 'power2.inOut',
        delay: 0.1,
      });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#EEEEEE] transition-none"
      style={{ pointerEvents: 'none' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Branded Circular Logo */}
        <div
          ref={logoRef}
          className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#00ADB5] via-[#222831] to-[#00ADB5] shadow-xl shadow-[#00ADB5]/30"
        >
          <img
            src="/smart-Building.png"
            alt="MoveSmart Loading"
            className="w-full h-full rounded-full object-cover bg-white"
          />
        </div>

        {/* Brand Title */}
        <div ref={textRef} className="flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
          <span className="font-extrabold text-2xl tracking-tight text-[#222831]">
            Move<span className="text-[#00ADB5]">Smart</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// frontend/src/components/ui/CustomCursor.jsx
// Non-intrusive accent glow follower that enhances interactions without masking native cursor or blocking clicks
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) return;

    setEnabled(true);

    const xTo = gsap.quickTo(cursorRef.current, 'x', { duration: 0.15, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursorRef.current, 'y', { duration: 0.15, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-hover');

      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  useEffect(() => {
    if (!cursorRef.current || !enabled) return;

    if (isHovered) {
      gsap.to(cursorRef.current, {
        scale: 1.8,
        opacity: 0.75,
        backgroundColor: 'rgba(0, 173, 181, 0.15)',
        borderColor: '#00ADB5',
        duration: 0.2,
        ease: 'power2.out',
      });
    } else {
      gsap.to(cursorRef.current, {
        scale: 1,
        opacity: 0.45,
        backgroundColor: 'rgba(0, 173, 181, 0.05)',
        borderColor: 'rgba(0, 173, 181, 0.5)',
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  }, [isHovered, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-[#00ADB5] pointer-events-none z-[9999] transition-opacity"
      style={{ willChange: 'transform' }}
    />
  );
}

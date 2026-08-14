// pages/Landing.jsx — Persistent 3D Fly-Through & Sideways Scroll Homepage Experience
import React, { useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

import PageLoader from '../components/ui/PageLoader';
import CustomCursor from '../components/ui/CustomCursor';
import ServerStatusToast from '../components/common/ServerStatusToast';
import CityModel from '../components/hero/CityModel';
import CityHero, { HeroNavbar } from '../components/hero/CityHero';
import DemoSection from '../components/sections/DemoSection';
import HowItWorks from '../components/sections/HowItWorks';
import ChooseRole from '../components/sections/ChooseRole';
import HorizontalScrollytelling from '../components/sections/HorizontalScrollytelling';
import VerifiedListings from '../components/sections/VerifiedListings';
import Statistics from '../components/sections/Statistics';
import FinalCTA from '../components/sections/FinalCTA';
import Footer from '../components/sections/Footer';
import { useScrolledPastHero } from '../hooks/useScrolledPastHero';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function Landing() {
  const scrolled = useScrolledPastHero();
  const [modelLoaded, setModelLoaded] = useState(false);
  const handleModelLoaded = useCallback(() => setModelLoaded(true), []);

  // Global ScrollSmoother Setup
  useGSAP(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let smoother;
    try {
      smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
        smoothTouch: 0.1,
      });
      window.gsapSmoother = smoother;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[ScrollSmoother] Initialization fallback:', err);
    }

    return () => {
      if (smoother) {
        smoother.kill();
        window.gsapSmoother = null;
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#EEEEEE] text-[#222831]">
      {/* Persistent Full-Screen 3D Model Background */}
      <CityModel onModelLoaded={handleModelLoaded} />

      {/* Fixed UI Overlays */}
      <PageLoader />
      <CustomCursor />
      <ServerStatusToast />
      <HeroNavbar scrolled={scrolled} />

      {/* Inertia Smooth Scroll Content */}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main className="relative z-10">
            <div id="hero-section">
              <CityHero modelLoaded={modelLoaded} />
            </div>
            <DemoSection />
            <HowItWorks />
            <ChooseRole />
            <HorizontalScrollytelling />
            <VerifiedListings />
            <Statistics />
            <div id="final-cta">
              <FinalCTA />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

// frontend/src/components/sections/ChooseRole.jsx
// Section 3 — "Choose Your Role" Marketplace Teaser with 3D Mouse Tilt and Stagger Reveal
import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Home, Building, Briefcase, Users, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const ROLES = [
  {
    id: 'renter',
    title: 'Find Accommodation',
    tagline: 'For Renters & Buyers',
    description:
      'Discover AI-ranked localities and verified homes matched perfectly to your budget, office commute, and lifestyle.',
    icon: Home,
    link: '/signup?role=renter',
    accent: '#00ADB5',
  },
  {
    id: 'owner',
    title: 'Property Owner',
    tagline: 'For Homeowners & Landlords',
    description:
      'List properties with automated AI rent valuations, instant verification badges, and direct pre-screened tenant leads.',
    icon: Building,
    link: '/signup?role=owner',
    accent: '#22C55E',
  },
  {
    id: 'broker',
    title: 'Certified Broker',
    tagline: 'For Licensed Agents',
    description:
      'Access high-intent relocation leads, manage digital viewings, and close deals faster with transparent admin oversight.',
    icon: Briefcase,
    link: '/signup?role=broker',
    accent: '#00ADB5',
  },
  {
    id: 'company',
    title: 'Company HR',
    tagline: 'For Corporate Relocation',
    description:
      'Manage corporate employee batch transfers, track housing budgets, and provide seamless move-in support.',
    icon: Users,
    link: '/signup?role=company',
    accent: '#00ADB5',
  },
];

export default function ChooseRole() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Stagger Reveal on Scroll
  useGSAP(() => {
    if (prefersReducedMotion) return;

    gsap.from(cardsRef.current, {
      y: 45,
      opacity: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    });
  }, { scope: sectionRef });

  // 3D Tilt Effect on MouseMove
  const handleMouseMove = (e, cardEl) => {
    if (prefersReducedMotion || !cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 6; // Max 6 deg
    const rotateY = ((x - centerX) / centerX) * 6;

    gsap.to(cardEl, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = (cardEl) => {
    if (prefersReducedMotion || !cardEl) return;
    gsap.to(cardEl, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.4,
      ease: 'power2.out',
    });
  };

  return (
    <section
      id="choose-role"
      ref={sectionRef}
      className="py-24 px-6 md:px-16 bg-[#EEEEEE]/90 relative overflow-hidden border-t border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[#00ADB5] font-bold text-sm uppercase tracking-wider font-['Plus_Jakarta_Sans']">
            Tailored Experiences
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#222831] tracking-tight mt-1 mb-4 font-['Plus_Jakarta_Sans']">
            Choose Your Journey
          </h2>
          <p className="text-[#393E46] text-base md:text-lg font-medium leading-relaxed">
            MoveSmart brings renters, homeowners, brokers, and enterprise HR together under one data-driven ecosystem.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROLES.map((role, i) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                ref={(el) => (cardsRef.current[i] = el)}
                onMouseMove={(e) => handleMouseMove(e, cardsRef.current[i])}
                onMouseLeave={() => handleMouseLeave(cardsRef.current[i])}
                className="interactive-hover group relative bg-white/80 backdrop-blur-md rounded-2xl p-7 border border-white/90 shadow-md hover:shadow-xl hover:bg-white transition-shadow duration-300 flex flex-col justify-between"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${role.accent}15` }}
                    >
                      <Icon size={24} color={role.accent} />
                    </div>
                    <span className="text-xs font-bold text-[#393E46] px-2.5 py-1 rounded-full bg-[#EEEEEE]">
                      {role.tagline}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-extrabold text-[#222831] mb-2.5 font-['Plus_Jakarta_Sans'] group-hover:text-[#00ADB5] transition-colors duration-200">
                    {role.title}
                  </h3>
                  <p className="text-[#393E46] text-sm font-medium leading-relaxed mb-6">
                    {role.description}
                  </p>
                </div>

                {/* Learn More Link */}
                <a
                  href={role.link}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00ADB5] hover:text-[#008C93] transition-colors no-underline font-['Plus_Jakarta_Sans']"
                >
                  <span>Learn more</span>
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

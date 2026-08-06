// frontend/src/components/sections/Footer.jsx
// Utility-focused Footer component
import React from 'react';

export default function Footer() {
  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetEl = document.querySelector(href);
      if (targetEl) {
        const smoother = window.gsapSmoother;
        if (smoother && typeof smoother.scrollTo === 'function') {
          smoother.scrollTo(targetEl, true, 'top top');
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <footer className="bg-[#222831] text-white py-16 px-6 md:px-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
        {/* Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <a href="/" onClick={(e) => { e.preventDefault(); window.gsapSmoother?.scrollTo(0, true) || window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#00ADB5] to-[#222831]">
              <img
                src="/smart-Building.png"
                alt="MoveSmart Logo"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
              Move<span className="text-[#00ADB5]">Smart</span>
            </span>
          </a>
          <p className="text-[#EEEEEE]/70 text-sm leading-relaxed max-w-sm font-medium">
            MoveSmart is an AI-powered city relocation marketplace matching renters, property owners, brokers, and enterprise teams with data-backed certainty.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-white font-['Plus_Jakarta_Sans'] mb-4">
            Marketplace
          </h4>
          <ul className="space-y-2.5 text-sm text-[#EEEEEE]/80 font-medium list-none p-0">
            <li><a href="#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="hover:text-[#00ADB5] transition-colors no-underline">How It Works</a></li>
            <li><a href="#choose-role" onClick={(e) => handleNavClick(e, '#choose-role')} className="hover:text-[#00ADB5] transition-colors no-underline">Marketplace Roles</a></li>
            <li><a href="#horizontal-scroll" onClick={(e) => handleNavClick(e, '#horizontal-scroll')} className="hover:text-[#00ADB5] transition-colors no-underline">Area Intelligence</a></li>
            <li><a href="#verified-listings" onClick={(e) => handleNavClick(e, '#verified-listings')} className="hover:text-[#00ADB5] transition-colors no-underline">Verified Homes</a></li>
          </ul>
        </div>

        {/* Roles */}
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-white font-['Plus_Jakarta_Sans'] mb-4">
            Portals
          </h4>
          <ul className="space-y-2.5 text-sm text-[#EEEEEE]/80 font-medium list-none p-0">
            <li><a href="/signup?role=renter" className="hover:text-[#00ADB5] transition-colors no-underline">Renters & Buyers</a></li>
            <li><a href="/signup?role=owner" className="hover:text-[#00ADB5] transition-colors no-underline">Property Owners</a></li>
            <li><a href="/signup?role=company" className="hover:text-[#00ADB5] transition-colors no-underline">Enterprise HR</a></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-white font-['Plus_Jakarta_Sans'] mb-4">
            Trust & Security
          </h4>
          <ul className="space-y-2.5 text-sm text-[#EEEEEE]/80 font-medium list-none p-0">
            <li><span className="text-[#22C55E] font-bold">✓ Admin Verified</span></li>
            <li><span className="text-[#00ADB5] font-bold">✓ ML Anomaly Screened</span></li>
            <li><a href="#" className="hover:text-[#00ADB5] transition-colors no-underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#00ADB5] transition-colors no-underline">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#EEEEEE]/60 font-medium">
        <p>© 2026 MoveSmart Technologies Inc. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Built for seamless city relocation & data-backed housing choices.</p>
      </div>
    </footer>
  );
}

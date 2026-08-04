import React from 'react';
import Container from './Container';

/**
 * Reusable Footer component (Secondary #393E46, Design.md §2).
 */
const Footer = () => {
  return (
    <footer className="bg-secondary text-surface py-8 border-t border-gray-700 mt-auto">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-300">
        <div>
          <span className="font-semibold text-surface">MoveSmart</span> &copy; 2026. All rights reserved.
        </div>
        <div className="flex gap-6">
          <span className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Terms of Service</span>
          <span className="hover:text-primary transition-colors cursor-pointer">Ahmedabad Housing Intelligence</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;

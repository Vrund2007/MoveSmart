import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Container from './Container';

/**
 * Main Layout Shell wrapping pages with Navbar, Container, and Footer.
 */
const MainLayout = ({ children, containerized = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 py-6">
        {containerized ? <Container>{children}</Container> : children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

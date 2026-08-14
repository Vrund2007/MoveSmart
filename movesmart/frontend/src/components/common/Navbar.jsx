import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Container from './Container';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';

/**
 * Reusable Navbar component following Design.md §2 (Secondary background #393E46, Primary accent #00ADB5).
 */
const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-secondary text-surface shadow-md border-b border-gray-700 sticky top-0 z-40">
      <Container className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-surface">
          <span className="bg-primary text-surface px-2 py-1 rounded-md text-sm font-black">MS</span>
          <span>Move<span className="text-primary">Smart</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {user?.role === 'find_accommodation' && (
                <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
              )}
              {user?.role === 'property_owner' && (
                <Link to="/owner/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Owner Dashboard</Link>
              )}
              {user?.role === 'broker' && (
                <Link to="/broker/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Broker Dashboard</Link>
              )}
              {user?.role === 'company_hr' && (
                <Link to="/company/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Company HR</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/review-queue" className="text-sm font-medium hover:text-primary transition-colors">Review Queue</Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-500 text-surface hover:bg-gray-700">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.location.pathname === '/') {
                    const targetEl = document.querySelector('#demo');
                    if (targetEl) {
                      const smoother = window.gsapSmoother;
                      if (smoother && typeof smoother.scrollTo === 'function') {
                        smoother.scrollTo(targetEl, true, 'top 100px');
                      } else {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                    window.dispatchEvent(new CustomEvent('play-demo-video'));
                  } else {
                    navigate('/#demo');
                  }
                }}
                className="border-primary/40 text-primary hover:bg-primary/10"
              >
                Show Demo
              </Button>
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;

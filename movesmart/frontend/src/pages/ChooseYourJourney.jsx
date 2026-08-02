// pages/ChooseYourJourney.jsx — Role selection screen (PRD §6, Architecture.md §4.0)
// Sends PATCH /api/auth/role with chosen role. Admin is omitted per FR-2.
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboard } from '../App';

const ROLES = [
  {
    id: 'find_accommodation',
    title: 'Find Accommodation',
    subtitle: 'Renter / Buyer',
    icon: '🏠',
    description: 'AI-ranked neighborhoods, commute insights, cost calculations & verified property matches.',
    color: '#00ADB5',
  },
  {
    id: 'property_owner',
    title: 'Property Owner',
    subtitle: 'Landlord / Investor',
    icon: '🏢',
    description: 'Direct verification submission, direct tenant inquiries & AI price predictions.',
    color: '#22C55E',
  },
  {
    id: 'broker',
    title: 'Certified Broker',
    subtitle: 'Real Estate Agent',
    icon: '🤝',
    description: 'Pipeline lead tracking, owner submission proxy & manual commission management.',
    color: '#F59E0B',
  },
  {
    id: 'company_hr',
    title: 'Company / HR',
    subtitle: 'Corporate Relocation',
    icon: '👔',
    description: 'Bulk employee relocation batches, budget breakdown & office-commute allocation.',
    color: '#6C3FF5',
  },
];

export default function ChooseYourJourney() {
  const [selectedRole, setSelectedRole] = useState('find_accommodation');
  const [error, setError] = useState('');
  const { setRole, loading } = useAuth();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setError('');
    const res = await setRole(selectedRole);
    if (res.success) {
      navigate(getRoleDashboard(selectedRole), { replace: true });
    } else {
      setError(res.error || 'Failed to assign role.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #00ADB5 0%, #222831 45%, #393E46 75%, #00ADB5 100%)',
      backgroundSize: '400% 400%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: 'white',
    }}>
      {/* Header / Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'white', marginBottom: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', padding: 2, background: 'linear-gradient(135deg, #00ADB5, #222831, #00ADB5)', boxShadow: '0 4px 16px rgba(0,173,181,0.35)' }}>
            <img src="/smart-Building.png" alt="MoveSmart" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', background: 'white' }} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Move<span style={{ color: '#00ADB5' }}>Smart</span>
          </span>
        </Link>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px 0' }}>
          Choose Your MoveSmart Journey
        </h1>
        <p style={{ fontSize: '0.95rem', opacity: 0.8, maxWidth: 500, margin: '0 auto' }}>
          Select how you will be using MoveSmart. This customizes your dashboard & tools.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        maxWidth: '1000px',
        width: '100%',
        marginBottom: '2rem',
      }}>
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.id;
          return (
            <div
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              style={{
                background: isSelected ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isSelected ? `2px solid ${r.color}` : '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '20px',
                padding: '1.75rem 1.5rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                color: isSelected ? '#222831' : 'white',
                boxShadow: isSelected ? `0 12px 32px ${r.color}33` : '0 4px 16px rgba(0,0,0,0.1)',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>{r.icon}</span>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: `2px solid ${isSelected ? r.color : 'rgba(255,255,255,0.5)'}`,
                  background: isSelected ? r.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px 0' }}>{r.title}</h3>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? r.color : '#00ADB5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                {r.subtitle}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, opacity: isSelected ? 0.85 : 0.7, margin: 0 }}>
                {r.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Error display */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#FFF', padding: '10px 20px', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={loading}
        style={{
          padding: '14px 44px',
          borderRadius: '14px',
          border: 'none',
          background: 'linear-gradient(135deg, #00ADB5, #008C93)',
          color: 'white',
          fontSize: '1rem',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 173, 181, 0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? 'Setting Role...' : 'Continue to Dashboard →'}
      </button>
    </div>
  );
}

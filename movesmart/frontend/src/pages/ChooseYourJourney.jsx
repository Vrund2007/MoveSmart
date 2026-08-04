// src/pages/ChooseYourJourney.jsx
// Role selection screen shown after signup (new v2.0, PRD §6, Architecture.md §4.0)
// Uses custom design style: light theme, clean spacing, no glassmorphism

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ROLES = [
  {
    id: 'find_accommodation',
    title: 'Accommodation Seeker',
    desc: 'Relocating to Ahmedabad? Access AI-driven locality scores, certified property listings, and personalized commute reports.',
    icon: '🏠',
    badge: 'Standard'
  },
  {
    id: 'property_owner',
    title: 'Property Owner / Landlord',
    desc: 'List your property, track customer enquiries, and monitor status updates on admin reviews.',
    icon: '🏢',
    badge: 'Managed'
  },
  {
    id: 'broker',
    title: 'Real Estate Broker',
    desc: 'Manage inventory across multiple owners, interact with verified seeker leads, and view transactions.',
    icon: '🤝',
    badge: 'Professional'
  },
  {
    id: 'company_hr',
    title: 'Company HR Coordinator',
    desc: 'Coordinate corporate employee allocations at scale, track budgets, and manage relocation batches.',
    icon: '👔',
    badge: 'Enterprise'
  }
];

export default function ChooseYourJourney() {
  const { setRole, setUser, user } = useContext(AuthContext);
  const [selected, setSelected] = useState('find_accommodation');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await setRole(selected);
      if (!res || !res.success) {
        // Fallback for frontend-only presentation
        const updatedUser = { ...user, role: selected };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      // Accommodation seekers go through the onboarding wizard; other roles go directly to dashboards
      if (selected === 'find_accommodation') {
        navigate('/onboarding');
      } else if (selected === 'property_owner') {
        navigate('/owner');
      } else if (selected === 'broker') {
        navigate('/broker');
      } else if (selected === 'company_hr') {
        navigate('/company');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <span className="text-[#00ADB5] font-semibold text-sm uppercase tracking-wider">Setup Account</span>
          <h1 className="text-4xl font-bold text-[#222831] mt-2 mb-3">Choose Your Relocation Journey</h1>
          <p className="text-[#393E46] max-w-lg mx-auto">
            Select the role that fits your goals. MoveSmart configures your custom workspace dashboard based on this choice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`bg-[#FFFFFF] p-6 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-md ${
                  isSelected
                    ? 'border-[#00ADB5] ring-2 ring-[#00ADB5]/10 shadow-sm'
                    : 'border-[#D9D9D9] hover:border-[#393E46]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl" role="img" aria-label={role.title}>
                      {role.icon}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        isSelected
                          ? 'bg-[#00ADB5]/10 text-[#00ADB5]'
                          : 'bg-[#EEEEEE] text-[#393E46]'
                      }`}
                    >
                      {role.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#222831] mb-2">{role.title}</h3>
                  <p className="text-sm text-[#393E46] leading-relaxed">{role.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-end">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#00ADB5] bg-[#00ADB5]'
                        : 'border-[#D9D9D9] bg-transparent'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-[#00ADB5] hover:bg-[#008C93] text-white font-semibold px-8 py-3 rounded-lg shadow-sm transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? 'Setting up workspace...' : 'Confirm Journey & Proceed'}
          </button>
        </div>
      </div>
    </div>
  );
}

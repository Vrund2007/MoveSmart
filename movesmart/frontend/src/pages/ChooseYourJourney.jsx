// src/pages/ChooseYourJourney.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HubIcon, BrowseIcon, UserIcon } from '../components/common/Icons';

const ROLES = [
  {
    id: 'find_accommodation',
    title: 'Accommodation Seeker',
    desc: 'Relocating to Ahmedabad? Access AI-driven locality scores, verified property listings, and personalized commute reports.',
    icon: HubIcon,
    badge: 'Standard'
  },
  {
    id: 'property_owner',
    title: 'Property Owner / Landlord',
    desc: 'List your property with automated AI valuations, track customer enquiries, and monitor approval status updates.',
    icon: BrowseIcon,
    badge: 'Managed'
  },
  {
    id: 'company_hr',
    title: 'Company HR Coordinator',
    desc: 'Coordinate corporate employee allocations at scale, track housing budgets, and manage relocation batches.',
    icon: UserIcon,
    badge: 'Enterprise'
  }
];

export default function ChooseYourJourney() {
  const { setRole } = useContext(AuthContext);
  const [selected, setSelected] = useState('find_accommodation');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await setRole(selected);
      if (res && res.success) {
        navigate('/onboarding');
      } else {
        setError(res?.error || 'Failed to set role. Role may already be assigned.');
      }
    } catch {
      setError('An unexpected error occurred while assigning role.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center px-6 py-12 font-sans">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-10">
          <span className="text-[#00ADB5] font-extrabold text-xs uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">
            Setup Account
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#222831] mt-3 mb-2">
            Choose Your Relocation Journey
          </h1>
          <p className="text-[#393E46] text-sm font-medium max-w-lg mx-auto">
            Select the role that fits your goals. MoveSmart configures your custom workspace dashboard based on this choice.
          </p>
        </div>

        {/* 3 Cards In One Line Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
          {ROLES.map((role) => {
            const IconComp = role.icon;
            const isSelected = selected === role.id;
            return (
              <div
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`bg-white p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between hover:shadow-xl ${
                  isSelected
                    ? 'border-2 border-[#00ADB5] ring-4 ring-[#00ADB5]/10 shadow-md'
                    : 'border-border hover:border-[#00ADB5]/50 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-[#00ADB5]">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        isSelected
                          ? 'bg-[#00ADB5] text-white shadow-xs'
                          : 'bg-surface text-[#393E46] border border-border'
                      }`}
                    >
                      {role.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#222831] mb-2">{role.title}</h3>
                  <p className="text-xs text-[#393E46] font-medium leading-relaxed">{role.desc}</p>
                </div>

                <div className="mt-6 flex items-center justify-end">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
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

        {error && (
          <div className="mb-4 text-center text-xs text-rose-700 font-bold bg-rose-50 p-3 rounded-xl border border-rose-200 max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="bg-[#00ADB5] hover:bg-teal-600 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-xs"
          >
            {submitting ? 'Setting up workspace...' : 'Confirm Journey & Proceed →'}
          </button>
        </div>
      </div>
    </div>
  );
}

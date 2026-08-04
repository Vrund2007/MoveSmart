// src/pages/Onboarding.jsx
// Onboarding questionnaire wizard for Accommodation Seeker (v2.0, PRD §6, Architecture.md §4.0)
// Collects: work_location, rent_budget, commute_tolerance, family_status, bhk_pref, lifestyle_pref

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileContext } from '../context/ProfileContext';

export default function Onboarding() {
  const { updateProfile } = useContext(ProfileContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Steps: 1 (Budget & Commute), 2 (Lifestyle Preferences), 3 (Family Details)

  // Local form state
  const [rentBudget, setRentBudget] = useState(30000);
  const [commuteTime, setCommuteTime] = useState(25);
  const [workLocation, setWorkLocation] = useState('Vastrapur');
  
  const [safetyWeight, setSafetyWeight] = useState(5);
  const [schoolsWeight, setSchoolsWeight] = useState(4);
  const [greeneryWeight, setGreeneryWeight] = useState(3);
  const [costWeight, setCostWeight] = useState(3);

  const [bhkPref, setBhkPref] = useState(3);
  const [familyStatus, setFamilyStatus] = useState('family');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const onboardingData = {
      rent_budget: Number(rentBudget),
      commute_tolerance: Number(commuteTime),
      work_location: workLocation,
      bhk_pref: Number(bhkPref),
      family_status: familyStatus,
      lifestyle_pref: {
        safety: Number(safetyWeight),
        schools: Number(schoolsWeight),
        greenery: Number(greeneryWeight),
        cost: Number(costWeight)
      }
    };
    await updateProfile(onboardingData);
    localStorage.setItem('movesmart_onboarding_completed', 'true');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white border border-[#D9D9D9] rounded-xl p-8 shadow-sm">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#D9D9D9]">
          <div>
            <span className="text-[#00ADB5] font-semibold text-xs uppercase tracking-wider">Step {step} of 3</span>
            <h1 className="text-2xl font-bold text-[#222831]">
              {step === 1 && 'Budget & Location'}
              {step === 2 && 'Relocation Priorities'}
              {step === 3 && 'Family & Sizing'}
            </h1>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-[#00ADB5]' : s < step ? 'bg-[#393E46]' : 'bg-[#D9D9D9]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Contents */}
        <div className="min-h-[280px]">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-[#222831] mb-2">
                  What is your preferred monthly rent budget? (INR)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="2000"
                    value={rentBudget}
                    onChange={(e) => setRentBudget(e.target.value)}
                    className="w-full h-2 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer accent-[#00ADB5]"
                  />
                  <span className="text-lg font-bold text-[#222831] w-28 tabular-nums">
                    ₹{Number(rentBudget).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#222831] mb-2">
                  Where is your work/office located in Ahmedabad?
                </label>
                <select
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  className="w-full border border-[#D9D9D9] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00ADB5] bg-white text-[#222831]"
                >
                  <option value="Vastrapur">Vastrapur / University Area</option>
                  <option value="Satellite">Satellite / Shivranjani</option>
                  <option value="Bodakdev">Bodakdev / SG Highway</option>
                  <option value="Thaltej">Thaltej / Metro Zone</option>
                  <option value="Prahladnagar">Prahladnagar Corporate Corridor</option>
                  <option value="Gota">Gota North Ahmedabad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#222831] mb-2">
                  Maximum acceptable commute tolerance? (Minutes)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={commuteTime}
                    onChange={(e) => setCommuteTime(e.target.value)}
                    className="w-full h-2 bg-[#EEEEEE] rounded-lg appearance-none cursor-pointer accent-[#00ADB5]"
                  />
                  <span className="text-lg font-bold text-[#222831] w-20 tabular-nums">
                    {commuteTime} min
                  </span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm text-[#393E46] mb-4">
                Rate how important each factor is for your relocation. MoveSmart uses these to rank localities.
              </p>

              {[
                { label: 'Safety & Low Crime Rate', val: safetyWeight, setVal: setSafetyWeight },
                { label: 'Proximity to Top Schools', val: schoolsWeight, setVal: setSchoolsWeight },
                { label: 'Parks & Greenery Space', val: greeneryWeight, setVal: setGreeneryWeight },
                { label: 'Affordable Living Expenses', val: costWeight, setVal: setCostWeight },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-[#EEEEEE] pb-3">
                  <span className="text-sm text-[#222831] font-medium">{item.label}</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => item.setVal(num)}
                        className={`w-8 h-8 rounded-md text-xs font-semibold border transition-all ${
                          item.val === num
                            ? 'bg-[#00ADB5] border-[#00ADB5] text-white shadow-sm'
                            : 'bg-white border-[#D9D9D9] text-[#393E46] hover:border-[#393E46]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-[#222831] mb-3">
                  What is your family status?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'single', label: 'Single Relocator', icon: '👤' },
                    { id: 'couple', label: 'Couple / Duo', icon: '👥' },
                    { id: 'family', label: 'Family with Kids', icon: '👨‍👩‍👧‍👦' },
                  ].map((status) => {
                    const isSelected = familyStatus === status.id;
                    return (
                      <button
                        key={status.id}
                        onClick={() => setFamilyStatus(status.id)}
                        className={`p-4 border rounded-lg transition-all text-center flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-[#00ADB5] bg-[#00ADB5]/5 text-[#222831]'
                            : 'border-[#D9D9D9] bg-white text-[#393E46] hover:border-[#393E46]'
                        }`}
                      >
                        <span className="text-2xl mb-1">{status.icon}</span>
                        <span className="text-xs font-semibold">{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#222831] mb-3">
                  Preferred BHK sizing?
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((bhk) => {
                    const isSelected = bhkPref === bhk;
                    return (
                      <button
                        key={bhk}
                        onClick={() => setBhkPref(bhk)}
                        className={`p-3 border rounded-lg font-bold text-center transition-all ${
                          isSelected
                            ? 'border-[#00ADB5] bg-[#00ADB5] text-white shadow-sm'
                            : 'border-[#D9D9D9] bg-white text-[#393E46] hover:border-[#393E46]'
                        }`}
                      >
                        {bhk} BHK
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#D9D9D9]">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-5 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
              step === 1
                ? 'opacity-40 cursor-not-allowed border-[#D9D9D9] text-[#393E46]'
                : 'border-[#D9D9D9] bg-white hover:border-[#393E46] text-[#393E46]'
            }`}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="bg-[#00ADB5] hover:bg-[#008C93] text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all duration-200 transform active:scale-[0.99]"
          >
            {step === 3 ? 'Generate Relocation Workspace' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

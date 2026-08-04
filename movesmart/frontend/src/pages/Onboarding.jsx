// src/pages/Onboarding.jsx — Role-based Onboarding Questionnaire (PRD §6, Architecture.md §4.0, database.md §3.1)
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Onboarding() {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Find Accommodation Form State
  const [salary, setSalary] = useState('');
  const [workLocationName, setWorkLocationName] = useState('SG Highway, Ahmedabad');
  const [rentBudget, setRentBudget] = useState('30000');
  const [lifestylePref, setLifestylePref] = useState('quiet');
  const [commuteTolerance, setCommuteTolerance] = useState('30');

  // Property Owner Form State
  const [ownerPhone, setOwnerPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Broker Form State
  const [brokerPhone, setBrokerPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');

  // Company HR Form State
  const [companyName, setCompanyName] = useState('');
  const [officeName, setOfficeName] = useState('GIFT City, Ahmedabad');

  const role = user?.role || 'find_accommodation';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    let profileData = {};

    if (role === 'find_accommodation') {
      profileData = {
        salary: salary ? Number(salary) : null,
        work_or_college_location: {
          name: workLocationName,
          coordinates: [72.5714, 23.0225]
        },
        rent_budget: Number(rentBudget),
        lifestyle_pref: lifestylePref,
        commute_tolerance_minutes: Number(commuteTolerance)
      };
    } else if (role === 'property_owner') {
      if (!ownerPhone.trim()) {
        setError('Contact phone is required.');
        setSubmitting(false);
        return;
      }
      profileData = {
        contact_phone: ownerPhone,
        business_name: businessName
      };
    } else if (role === 'broker') {
      if (!brokerPhone.trim() || !agencyName.trim()) {
        setError('Agency name and contact phone are required.');
        setSubmitting(false);
        return;
      }
      profileData = {
        contact_phone: brokerPhone,
        agency_name: agencyName
      };
    } else if (role === 'company_hr') {
      if (!companyName.trim()) {
        setError('Company name is required.');
        setSubmitting(false);
        return;
      }
      profileData = {
        company_name: companyName,
        office_locations: [
          {
            name: officeName,
            coordinates: [72.5714, 23.0225]
          }
        ]
      };
    }

    const res = await updateProfile(profileData);
    if (res && res.success) {
      if (role === 'property_owner') navigate('/owner');
      else if (role === 'broker') navigate('/broker');
      else if (role === 'company_hr') navigate('/company');
      else navigate('/dashboard');
    } else {
      setError(res?.error || 'Failed to update profile. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] flex flex-col justify-center items-center px-6 py-12">
      <div className="w-full max-w-xl bg-white border border-[#D9D9D9] rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8 border-b border-[#D9D9D9] pb-4">
          <span className="text-[#00ADB5] font-semibold text-xs uppercase tracking-wider">Workspace Onboarding</span>
          <h1 className="text-2xl font-bold text-[#222831] mt-1">
            {role === 'find_accommodation' && 'Accommodation Preferences'}
            {role === 'property_owner' && 'Owner Contact Information'}
            {role === 'broker' && 'Broker Agency Details'}
            {role === 'company_hr' && 'Corporate Relocation Setup'}
          </h1>
          <p className="text-xs text-[#393E46] mt-1">
            Complete your profile details to unlock your personalized workspace.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-error font-medium bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Find Accommodation Form */}
          {role === 'find_accommodation' && (
            <>
              <Input
                label="Monthly Rent Budget (₹)"
                type="number"
                required
                value={rentBudget}
                onChange={(e) => setRentBudget(e.target.value)}
                placeholder="e.g. 25000"
              />
              <Input
                label="Work / College Location Name"
                required
                value={workLocationName}
                onChange={(e) => setWorkLocationName(e.target.value)}
                placeholder="e.g. SG Highway, Ahmedabad"
              />
              <Input
                label="Commute Tolerance (Minutes)"
                type="number"
                required
                value={commuteTolerance}
                onChange={(e) => setCommuteTolerance(e.target.value)}
                placeholder="e.g. 30"
              />
              <Input
                label="Monthly Salary (Optional)"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 75000"
              />
              <div>
                <label className="block text-xs font-semibold text-[#222831] mb-1">
                  Lifestyle Preference
                </label>
                <select
                  value={lifestylePref}
                  onChange={(e) => setLifestylePref(e.target.value)}
                  className="w-full border border-[#D9D9D9] p-2.5 rounded-md text-xs text-[#222831] outline-none focus:border-[#00ADB5]"
                >
                  <option value="quiet">Quiet & Residential</option>
                  <option value="vibrant">Vibrant & Nightlife</option>
                  <option value="transit">Metro & Public Transit Focus</option>
                </select>
              </div>
            </>
          )}

          {/* Property Owner Form */}
          {role === 'property_owner' && (
            <>
              <Input
                label="Contact Phone"
                required
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Business / Agency Name (Optional)"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Unique Properties"
              />
            </>
          )}

          {/* Broker Form */}
          {role === 'broker' && (
            <>
              <Input
                label="Agency Name"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Apex Realty Brokerage"
              />
              <Input
                label="Contact Phone"
                required
                value={brokerPhone}
                onChange={(e) => setBrokerPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </>
          )}

          {/* Company HR Form */}
          {role === 'company_hr' && (
            <>
              <Input
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. TechCorp Solutions"
              />
              <Input
                label="Main Office Location"
                required
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g. GIFT City, Ahmedabad"
              />
            </>
          )}

          <Button type="submit" variant="primary" loading={submitting} className="mt-4">
            Complete Onboarding & Launch Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

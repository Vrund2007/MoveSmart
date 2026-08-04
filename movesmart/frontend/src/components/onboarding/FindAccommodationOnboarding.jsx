import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * FindAccommodationOnboarding Component.
 */
const FindAccommodationOnboarding = ({ onSubmit }) => {
  const [rentBudget, setRentBudget] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [commuteTolerance, setCommuteTolerance] = useState('30');
  const [lifestylePref, setLifestylePref] = useState('quiet');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      rent_budget: Number(rentBudget),
      work_or_college_location: { name: workLocation, coordinates: [72.5714, 23.0225] },
      commute_tolerance_minutes: Number(commuteTolerance),
      lifestyle_pref: lifestylePref
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      <Input label="Monthly Rent Budget (₹)" type="number" required value={rentBudget} onChange={(e) => setRentBudget(e.target.value)} placeholder="e.g. 20000" />
      <Input label="Work/College Location" required value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} placeholder="e.g. SG Highway, Ahmedabad" />
      <Input label="Max Commute Tolerance (Minutes)" type="number" required value={commuteTolerance} onChange={(e) => setCommuteTolerance(e.target.value)} />
      <div>
        <label className="text-sm font-medium text-text-primary mb-1 block">Lifestyle Preference</label>
        <select value={lifestylePref} onChange={(e) => setLifestylePref(e.target.value)} className="w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary outline-none">
          <option value="quiet">Quiet & Residential</option>
          <option value="vibrant">Vibrant & Nightlife</option>
          <option value="transit">Transit & Metro Focus</option>
        </select>
      </div>
      <Button type="submit" variant="primary" className="mt-2">Complete Profile</Button>
    </form>
  );
};

export default FindAccommodationOnboarding;

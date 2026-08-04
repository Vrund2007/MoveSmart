import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * CompanyHrOnboarding Component.
 */
const CompanyHrOnboarding = ({ onSubmit }) => {
  const [companyName, setCompanyName] = useState('');
  const [officeName, setOfficeName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      company_name: companyName,
      office_locations: [{ name: officeName, coordinates: [72.5714, 23.0225] }]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      <Input label="Company Name" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. TechCorp Solutions" />
      <Input label="Main Office Location" required value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="e.g. GIFT City, Ahmedabad" />
      <Button type="submit" variant="primary" className="mt-2">Complete Profile</Button>
    </form>
  );
};

export default CompanyHrOnboarding;

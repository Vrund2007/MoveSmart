import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * BrokerOnboarding Component.
 */
const BrokerOnboarding = ({ onSubmit }) => {
  const [contactPhone, setContactPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ contact_phone: contactPhone, agency_name: agencyName });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      <Input label="Contact Phone" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" />
      <Input label="Agency Name" required value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="e.g. Apex Realty" />
      <Button type="submit" variant="primary" className="mt-2">Complete Profile</Button>
    </form>
  );
};

export default BrokerOnboarding;

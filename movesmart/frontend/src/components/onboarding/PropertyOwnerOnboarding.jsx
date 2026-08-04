import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * PropertyOwnerOnboarding Component.
 */
const PropertyOwnerOnboarding = ({ onSubmit }) => {
  const [contactPhone, setContactPhone] = useState('');
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ contact_phone: contactPhone, business_name: businessName });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      <Input label="Contact Phone" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" />
      <Input label="Business/Agency Name (Optional)" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Unique Properties" />
      <Button type="submit" variant="primary" className="mt-2">Complete Profile</Button>
    </form>
  );
};

export default PropertyOwnerOnboarding;

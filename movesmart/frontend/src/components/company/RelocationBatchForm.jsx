import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * RelocationBatchForm Component.
 */
const RelocationBatchForm = ({ onSubmit }) => {
  const [headcount, setHeadcount] = useState('');
  const [budget, setBudget] = useState('');
  const [officeName, setOfficeName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      headcount: Number(headcount),
      budget: Number(budget),
      office_locations: [{ name: officeName, coordinates: [72.5714, 23.0225] }]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md w-full">
      <Input label="Office Location" required value={officeName} onChange={(e) => setOfficeName(e.target.value)} placeholder="e.g. GIFT City" />
      <Input label="Employee Headcount" type="number" required value={headcount} onChange={(e) => setHeadcount(e.target.value)} placeholder="e.g. 10" />
      <Input label="Total Batch Budget (₹)" type="number" required value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 250000" />
      <Button type="submit" variant="primary" className="mt-2">Create Relocation Batch</Button>
    </form>
  );
};

export default RelocationBatchForm;

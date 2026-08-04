import React, { useState } from 'react';
import Button from '../common/Button';

/**
 * EnquiryForm Component — Send structured contact message to Owner/Broker.
 */
const EnquiryForm = ({ onSubmit }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmit(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-text-primary">Send Enquiry to Owner / Broker</label>
      <textarea
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        placeholder="Introduce yourself and inquire about availability or visit timing..."
        className="w-full bg-surface border border-border rounded-md p-3 text-sm text-text-primary outline-none focus:border-primary"
      />
      <Button type="submit" variant="primary" className="self-end">
        Send Enquiry
      </Button>
    </form>
  );
};

export default EnquiryForm;

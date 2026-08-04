import React from 'react';
import LeadStatusBoard from './LeadStatusBoard';

/**
 * LeadBoard Component wrapper.
 */
const LeadBoard = ({ leads = [], onStatusUpdate }) => {
  return <LeadStatusBoard leads={leads} onStatusUpdate={onStatusUpdate} />;
};

export default LeadBoard;

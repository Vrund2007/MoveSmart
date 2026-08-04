import React from 'react';
import Card from '../common/Card';

/**
 * ChooseYourJourneyCard Component — Select role card.
 */
const ChooseYourJourneyCard = ({ role, title, description, selected = false, onClick }) => {
  return (
    <Card
      onClick={onClick}
      className={`p-6 transition-all border-2 ${
        selected ? 'border-primary bg-teal-50/50 shadow-md' : 'border-border hover:border-gray-400'
      }`}
    >
      <h3 className="font-bold text-lg text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary">{description}</p>
    </Card>
  );
};

export default ChooseYourJourneyCard;

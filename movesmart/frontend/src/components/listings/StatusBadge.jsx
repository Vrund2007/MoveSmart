import React from 'react';

/**
 * StatusBadge Component (Design.md §2: Success #22C55E, Warning #F59E0B, Error #EF4444).
 */
const StatusBadge = ({ status = 'pending_review' }) => {
  const styles = {
    approved: 'bg-green-100 text-success border-green-200',
    pending_review: 'bg-amber-100 text-warning border-amber-200',
    rejected: 'bg-red-100 text-error border-red-200',
  };

  const labels = {
    approved: 'Approved',
    pending_review: 'Pending Review',
    rejected: 'Rejected',
  };

  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status] || styles.pending_review}`}>
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;

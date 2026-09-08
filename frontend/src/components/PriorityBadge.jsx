import React from 'react';

/**
 * Standardized DevFlow Priority Badge
 * CRITICAL: red, HIGH: orange, MEDIUM: blue, LOW: gray
 */
const PriorityBadge = ({ priority, className = '' }) => {
  const normalized = priority ? priority.toUpperCase() : 'MEDIUM';

  const styles = {
    CRITICAL: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200/80 dark:border-red-900/50',
    HIGH: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/50',
    MEDIUM: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
    LOW: 'bg-slate-100 dark:bg-[#1B1F27] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#2A303A]',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles[normalized] || styles.MEDIUM} ${className}`}>
      {normalized}
    </span>
  );
};

export default PriorityBadge;

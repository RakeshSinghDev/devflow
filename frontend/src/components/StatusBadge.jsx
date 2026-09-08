import React from 'react';

/**
 * Standardized DevFlow Status Badge
 * TODO: neutral gray, IN_PROGRESS: blue, IN_REVIEW: purple, DONE: green
 */
const StatusBadge = ({ status, className = '' }) => {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, '_') : 'TODO';

  const styles = {
    TODO: 'bg-slate-100 dark:bg-[#1B1F27] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#2A303A]',
    IN_PROGRESS: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/50',
    IN_REVIEW: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-900/50',
    DONE: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/50',
  };

  const labels = {
    TODO: 'To Do',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    DONE: 'Done',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[normalized] || styles.TODO} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {labels[normalized] || status}
    </span>
  );
};

export default StatusBadge;

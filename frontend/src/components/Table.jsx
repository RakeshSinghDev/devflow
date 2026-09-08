import React from 'react';

/**
 * Standardized DevFlow Enterprise Data Table Wrapper
 * Modern table layout with compact headers, subtle row borders, and dark mode support.
 */
export const Table = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto border border-border-light dark:border-border-dark rounded-xl bg-white dark:bg-[#15181E] shadow-soft-sm ${className}`}>
      <table className="w-full text-left text-sm border-collapse">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-slate-50 dark:bg-[#1B1F27]/80 border-b border-border-light dark:border-border-dark text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark uppercase tracking-wider">
      {children}
    </thead>
  );
};

export const TableRow = ({ children, onClick, className = '' }) => {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 dark:border-border-dark/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-[#1B1F27]/50 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHeadCell = ({ children, className = '' }) => {
  return (
    <th className={`px-4 py-3 font-semibold ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <tbody className="divide-y divide-slate-100 dark:divide-border-dark/60 text-text-primaryLight dark:text-text-primaryDark">
      {children}
    </tbody>
  );
};

export default Table;

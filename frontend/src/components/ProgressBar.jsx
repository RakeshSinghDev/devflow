import React from 'react';

/**
 * DevFlow Reusable Progress Bar Component
 * Clean progress visualization driven 100% by real data.
 */
const ProgressBar = ({
  progress = 0,
  showLabel = true,
  size = 'md',
  color = 'blue',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  const colorStyles = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-emerald-600 dark:bg-emerald-500',
    purple: 'bg-purple-600 dark:bg-purple-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-text-secondaryLight dark:text-text-secondaryDark">Progress</span>
          <span className="font-semibold text-text-primaryLight dark:text-text-primaryDark">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-[#1B1F27] rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`h-full transition-all duration-300 rounded-full ${colorStyles[color] || colorStyles.blue}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

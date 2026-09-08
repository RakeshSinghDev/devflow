import React from 'react';

export default function DevFlowLogo({ size = 'md', showText = true, className = '', variant = 'container' }) {
  const containerSizes = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-8.5 h-8.5 rounded-xl text-sm',
    lg: 'w-10 h-10 rounded-xl text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizes = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* DevFlow Icon Container / Mark */}
      {variant === 'container' ? (
        <div
          className={`flex items-center justify-center bg-blue-600 text-white shrink-0 shadow-xs active:scale-95 transition-transform ${
            containerSizes[size] || 'w-8.5 h-8.5 rounded-xl'
          }`}
        >
          <DevFlowMark className={iconSizes[size] || 'w-5 h-5'} color="currentColor" />
        </div>
      ) : (
        <div className="flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
          <DevFlowMark className={iconSizes[size] || 'w-6 h-6'} color="currentColor" />
        </div>
      )}

      {showText && (
        <span
          className={`tracking-tight text-slate-900 dark:text-slate-100 ${
            textSizes[size] || 'text-base font-semibold'
          }`}
        >
          DevFlow
        </span>
      )}
    </div>
  );
}

export function DevFlowMark({ className = 'w-5 h-5', color = 'currentColor' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Precision Geometric DevFlow Mark (Structure + Flow) */}
      <path
        d="M4.5 4.5H11.5C15.0899 4.5 18 7.41015 18 11C18 14.5899 15.0899 17.5 11.5 17.5H7.5V19.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 11H15.5C17.7091 11 19.5 12.7909 19.5 15C19.5 17.2091 17.7091 19 15.5 19H10.5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

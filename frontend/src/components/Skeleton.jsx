import React from 'react';

/**
 * Standardized DevFlow Loading Skeleton Component
 */
const Skeleton = ({ className = '', variant = 'text' }) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    avatar: 'h-8 w-8 rounded-full',
    card: 'h-32 w-full rounded-[16px]',
    button: 'h-10 w-24 rounded-xl',
  };

  return (
    <div className={`animate-pulse bg-slate-200/70 dark:bg-[#1B1F27] ${variantStyles[variant] || ''} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-[16px] p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export const ListSkeleton = ({ rows = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-white dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-xl px-4 flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-border-light dark:border-border-dark">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CardSkeleton />
      </div>
      <CardSkeleton />
    </div>
  </div>
);

export default Skeleton;

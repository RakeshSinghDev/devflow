import React from 'react';

/**
 * Standardized DevFlow Page Header Component
 * Editorial typography scale: Title 32-40px font-weight 600, Subtitle 14-16px.
 */
const PageHeader = ({ title, subtitle, actions, className = "" }) => {
  return (
    <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-6 border-b border-border-light dark:border-border-dark ${className}`}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primaryLight dark:text-text-primaryDark">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-secondaryLight dark:text-text-secondaryDark mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

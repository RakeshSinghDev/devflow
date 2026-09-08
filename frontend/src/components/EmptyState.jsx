import React from 'react';
import Button from './Button';

/**
 * Standardized DevFlow Empty State Component
 * Compact, restrained, and functional without oversized decorative graphics.
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center bg-white dark:bg-[#15181E] border border-dashed border-border-light dark:border-border-dark rounded-2xl ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1B1F27] text-text-secondaryLight dark:text-text-secondaryDark flex items-center justify-center mx-auto mb-3">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primaryLight dark:text-text-primaryDark">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

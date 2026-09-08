import React from 'react';

/**
 * Standardized DevFlow Input / Select Component
 * Height: 44–48px, Radius: 10–12px, Focus: Blue border + subtle ring
 */
export const Input = React.forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-mutedLight dark:text-text-mutedDark">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full h-11 ${Icon ? 'pl-10' : 'px-3.5'} pr-3.5 bg-white dark:bg-[#15181E] border ${
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-border-light dark:border-border-dark focus:border-blue-600 dark:focus:border-blue-500 focus:ring-blue-500/20'
          } rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark placeholder-text-mutedLight dark:placeholder-text-mutedDark transition-all focus:outline-none focus:ring-2 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Select = React.forwardRef(({
  label,
  error,
  icon: Icon,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-mutedLight dark:text-text-mutedDark">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <select
          ref={ref}
          className={`w-full h-11 ${Icon ? 'pl-10' : 'px-3.5'} pr-8 bg-white dark:bg-[#15181E] border ${
            error
              ? 'border-red-500 focus:ring-red-500/20'
              : 'border-border-light dark:border-border-dark focus:border-blue-600 dark:focus:border-blue-500 focus:ring-blue-500/20'
          } rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark transition-all focus:outline-none focus:ring-2 ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';

export const Textarea = React.forwardRef(({
  label,
  error,
  rows = 3,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-text-secondaryLight dark:text-text-secondaryDark mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full p-3.5 bg-white dark:bg-[#15181E] border ${
          error
            ? 'border-red-500 focus:ring-red-500/20'
            : 'border-border-light dark:border-border-dark focus:border-blue-600 dark:focus:border-blue-500 focus:ring-blue-500/20'
        } rounded-xl text-sm text-text-primaryLight dark:text-text-primaryDark placeholder-text-mutedLight dark:placeholder-text-mutedDark transition-all focus:outline-none focus:ring-2 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;

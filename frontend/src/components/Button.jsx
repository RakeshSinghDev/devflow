import React from 'react';

/**
 * Standardized DevFlow Button Component
 * Height: 36–44px, Radius: 10–12px (rounded-xl), Medium font-weight
 * Forwards HTML props (such as form, aria-label, etc.) to underlying <button>
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all active-press focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const sizeStyles = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-11 px-5 text-sm gap-2",
  };

  const variantStyles = {
    primary: "bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white shadow-soft-sm",
    secondary: "bg-white dark:bg-[#1B1F27] border border-border-light dark:border-border-dark text-text-primaryLight dark:text-text-primaryDark hover:bg-slate-50 dark:hover:bg-[#222732] shadow-soft-sm",
    ghost: "bg-transparent text-text-secondaryLight dark:text-text-secondaryDark hover:bg-slate-100 dark:hover:bg-[#1B1F27] hover:text-text-primaryLight dark:hover:text-text-primaryDark",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-soft-sm",
    darkDestructive: "bg-[#111111] dark:bg-[#16181D] hover:bg-[#222222] dark:hover:bg-[#222630] text-white border border-stone-800 dark:border-stone-700 shadow-soft-sm transition-colors",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};

export default Button;

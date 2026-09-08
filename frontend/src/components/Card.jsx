import React from 'react';

/**
 * Reusable DevFlow Card Component
 * Variants:
 * - compact: small metrics, 14-16px radius, padding 4
 * - standard: default cards, 16px radius, padding 5-6
 * - feature: major cards, 18-20px radius, padding 6-8
 */
const Card = ({
  children,
  variant = 'standard',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseStyles = "bg-white dark:bg-[#15181E] border border-border-light dark:border-border-dark transition-colors";
  
  const variantStyles = {
    compact: "rounded-2xl p-4 shadow-soft-sm",
    standard: "rounded-[16px] p-5 sm:p-6 shadow-soft",
    feature: "rounded-[20px] p-6 sm:p-8 shadow-soft-md",
  };

  const hoverStyles = hoverable ? "card-hover cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.standard} ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;

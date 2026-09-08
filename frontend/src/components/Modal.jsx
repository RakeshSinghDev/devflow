import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Standardized DevFlow Modal Component (Viewport Portal Rendered)
 * 16-20px radius, subtle shadow, white/dark surface, clear title & actions
 */
const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
      <div
        className={`w-full ${maxWidth} bg-white dark:bg-[#15181E] border border-border-light dark:border-border-dark rounded-[18px] shadow-soft-lg overflow-hidden transform transition-all animate-in zoom-in-95 duration-150`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5 sm:p-6 border-b border-border-light dark:border-border-dark">
          <div>
            <h3 className="text-lg font-semibold text-text-primaryLight dark:text-text-primaryDark">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-text-secondaryLight dark:text-text-secondaryDark mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-mutedLight dark:text-text-mutedDark hover:text-text-primaryLight dark:hover:text-text-primaryDark rounded-lg hover:bg-slate-100 dark:hover:bg-[#1B1F27] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;

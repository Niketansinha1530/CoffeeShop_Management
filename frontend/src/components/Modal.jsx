import { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal — bottom sheet on mobile, centered on sm+ */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white shadow-2xl
          flex flex-col
          max-h-[92vh]
          rounded-t-3xl sm:rounded-2xl
          sheet-enter sm:animate-slide-up
        `}
      >
        {/* Drag handle pill — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-dark-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-dark-100">
          <h2 className="text-base sm:text-lg font-bold text-dark-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-dark-100 transition-colors text-dark-400 hover:text-dark-700"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

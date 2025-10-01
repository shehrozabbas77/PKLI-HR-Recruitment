
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Allow title to be a ReactNode to support complex titles with icons.
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} transform transition-all max-h-[90vh] flex flex-col animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-200 sticky top-0 bg-white z-10 rounded-t-xl">
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end items-center p-4 border-t bg-slate-50 rounded-b-xl sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Add keyframe animation to your global stylesheet (e.g., index.css or a style tag in index.html)
/*
@keyframes scale-in {
  0% {
    opacity: 0;
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-scale-in {
  animation: scale-in 0.2s ease-out forwards;
}
*/
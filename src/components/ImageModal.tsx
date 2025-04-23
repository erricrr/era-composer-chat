import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
}

export function ImageModal({ isOpen, onClose, imageSrc, composerName }: ImageModalProps) {
  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Lock body scroll when modal opens
  React.useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup function to restore original overflow style
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{ position: 'fixed', touchAction: 'none' }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative max-w-[90vw] max-h-[90vh] rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageSrc}
            alt={composerName}
            className="w-full h-auto object-contain max-h-[80vh]"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black/50 text-white p-1 sm:p-1.5 md:p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-center font-serif">
            {composerName}
          </div>
        </div>
      </div>
    </div>
  );
}

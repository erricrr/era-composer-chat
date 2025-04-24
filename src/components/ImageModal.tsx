// ImageModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
  country?: string;
  years?: string;
  caption?: string;
  copyright?: string;
  sourceUrl?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  composerName,
  country,
  years,
  caption,
  copyright = "Image copyright",
  sourceUrl
}: ImageModalProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 150);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
      onClick={onClose}
    >
      <div
        className="bg-[hsl(40,50%,98%)] dark:bg-[hsl(220,15%,18%)] rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-[hsl(45,30%,88%)] dark:border-[hsl(220,15%,25%)]"
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[hsl(45,30%,88%)] dark:border-[hsl(220,15%,25%)]">
          <div>
            <h2 className="text-lg font-medium text-[hsl(220,15%,25%)] dark:text-[hsl(40,50%,95%)]">
              {composerName}
            </h2>
            <div className="flex text-sm text-[hsl(220,15%,45%)] dark:text-[hsl(40,20%,65%)] mt-1">
              {country && <span>{country}</span>}
              {country && years && <span className="mx-2">•</span>}
              {years && <span>{years}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[hsl(220,15%,45%)] hover:text-[hsl(220,15%,25%)] dark:text-[hsl(40,20%,65%)] dark:hover:text-[hsl(40,50%,95%)] transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Image container */}
        <div className="flex justify-center bg-[hsl(45,50%,96%)] dark:bg-[hsl(220,15%,15%)] p-4">
          <img
            src={imageSrc}
            alt={composerName}
            className="max-h-96 w-auto object-contain shadow-md dark:shadow-none border border-[hsl(45,30%,88%)] dark:border-[hsl(220,15%,25%)]"
          />
        </div>

        {/* Copyright information */}
        <div className="px-4 py-2 text-xs text-[hsl(220,15%,45%)] dark:text-[hsl(40,20%,65%)] border-t border-[hsl(45,30%,88%)] dark:border-[hsl(220,15%,25%)] bg-[hsl(45,35%,90%)] dark:bg-[hsl(220,15%,22%)]">
          <span>{copyright}</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

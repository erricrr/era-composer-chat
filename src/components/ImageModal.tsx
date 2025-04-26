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
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-lg overflow-hidden border"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          borderColor: 'hsl(var(--border))',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
          margin: '1rem 0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex justify-between items-center px-4 py-3 border-b"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div>
            <h2 className="text-lg font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {composerName}
            </h2>
            <div className="flex text-sm mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {country && <span>{country}</span>}
              {country && years && <span className="mx-2">•</span>}
              {years && <span>{years}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{
              color: 'hsl(var(--muted-foreground))',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'hsl(var(--foreground))')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')
            }
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Image container with reduced horizontal padding */}
        <div
          className="flex justify-center py-4 px-2"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <img
            src={imageSrc}
            alt={composerName}
            className="max-h-72 sm:max-h-80 md:max-h-96 w-auto object-contain shadow-md border"
            style={{ borderColor: 'hsl(var(--border))' }}
          />
        </div>

        {/* Caption if available */}
        {caption && (
          <div className="px-4 pb-3 text-sm" style={{ color: 'hsl(var(--foreground))' }}>
            {caption}
          </div>
        )}

        {/* Copyright */}
        <div
          className="px-4 py-2 text-xs border-t"
          style={{
            color: 'hsl(var(--muted-foreground))',
            backgroundColor: 'hsl(var(--muted))',
            borderColor: 'hsl(var(--border))',
          }}
        >
          <span>{copyright}</span>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
              style={{ color: 'hsl(var(--primary))' }}
            >
              Source
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

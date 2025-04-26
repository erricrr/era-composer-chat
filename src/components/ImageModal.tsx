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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'hsl(var(--background) / 0.8)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-auto max-w-3xl rounded-lg" // Added rounded-lg here
        style={{
          backgroundColor: 'hsl(var(--secondary))',
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-3 border-b rounded-t-lg" // Added rounded-t-lg here
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          <div>
            <h2
              className="text-lg font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {composerName}
            </h2>
            <div
              className="flex text-sm"
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {country && <span>{country}</span>}
              {country && years && <span className="mx-2">•</span>}
              {years && <span>{years}</span>}
            </div>
          </div>

          <button
  onClick={onClose}
  className="p-1 rounded-full hover:bg-[hsl(var(--card))]" // Use the --muted color for hover background
  style={{ color: 'hsl(var(--muted-foreground))' }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
</button>


        </div>

        {/* Image container */}
        <div
          className="flex items-center justify-center"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <img
            src={imageSrc}
            alt={composerName}
            className="max-h-[70vh] w-auto"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t"
          style={{ borderColor: 'hsl(var(--border))' }}
        >
          {caption && (
            <p
              className="text-sm mb-2"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              {caption}
            </p>
          )}
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>
              {copyright}
            </span>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: 'hsl(var(--primary))' }}
              >
                Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

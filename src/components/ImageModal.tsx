import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getCopyrightAttribution, CopyrightDetails } from '@/data/composers'; // Assuming this path is correct

// --- Constants ---
const ANIMATION_DURATION_MS = 150;
const MODAL_TITLE_ID = 'image-modal-title';
const MODAL_DESCRIPTION_ID = 'image-modal-description';

// --- Types ---
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
  composerId: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number | null;
  caption?: string;
  sourceUrl?: string;
}

interface ModalHeaderProps {
  composerName: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number | null;
  onClose: () => void;
}

interface ModalImageProps {
  imageSrc: string;
  altText: string;
}

interface ModalFooterProps {
  caption?: string;
  copyrightDetails: CopyrightDetails | null;
  sourceUrl?: string;
}

// --- Sub-Components ---

const ModalHeader: React.FC<ModalHeaderProps> = ({
  composerName,
  nationality,
  birthYear,
  deathYear,
  onClose,
}) => {
  const years = useMemo(() => {
    if (!birthYear) return '';
    return `${birthYear}${deathYear ? `-${deathYear}` : '-present'}`;
  }, [birthYear, deathYear]);

  return (
    <div
      className="flex justify-between items-center p-3 border-b rounded-t-lg group cursor-pointer"
      style={{ borderColor: 'hsl(var(--border))' }}
      onClick={onClose} // Close when clicking the header area
    >
      <div>
        <h2
          id={MODAL_TITLE_ID} // For aria-labelledby
          className="text-lg font-medium"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {composerName}
        </h2>
        <div
          className="flex text-sm"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {nationality && <span>{nationality}</span>}
          {nationality && years && <span className="mx-2">•</span>}
          {years && <span>{years}</span>}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation(); // Prevent header click from triggering onClose twice
          onClose();
        }}
        className="p-1 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100 group-hover:bg-primary/20"
        aria-label="Close modal"
      >
        {/* Close Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
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
  );
};

const ModalImage: React.FC<ModalImageProps> = ({ imageSrc, altText }) => (
  <div
    className="flex items-center justify-center"
    style={{ backgroundColor: 'hsl(var(--background))' }}
  >
    <img
      src={imageSrc}
      alt={altText}
      className="max-h-[70vh] w-auto"
      style={{ objectFit: 'contain' }}
    />
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({
  caption,
  copyrightDetails,
  sourceUrl,
}) => (
  <div
    id={MODAL_DESCRIPTION_ID} // For aria-describedby
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
        {copyrightDetails ? (
          <>
            Image by {copyrightDetails.author} via{' '}
            <a
              href={copyrightDetails.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              {copyrightDetails.source}
            </a>
            , licensed under{' '}
            <a
              href={copyrightDetails.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              {copyrightDetails.license}
            </a>
          </>
        ) : (
            // Provide a fallback or render nothing if copyright is missing
             null
        )}
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
          style={{ color: 'hsl(var(--primary))' }}
        >
          Source
        </a>
      )}
    </div>
  </div>
);

// --- Main Component ---

export function ImageModal({
  isOpen,
  onClose,
  imageSrc,
  composerName,
  composerId,
  nationality,
  birthYear,
  deathYear,
  caption,
  sourceUrl,
}: ImageModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const copyrightDetails = useMemo(() => getCopyrightAttribution(composerId), [composerId]);

  useEffect(() => {
    // Check if modal was open before refresh
    const wasModalOpen = sessionStorage.getItem('modalOpen');
    if (wasModalOpen === 'true') {
      // Clear the storage and call onClose to ensure modal starts closed
      sessionStorage.removeItem('modalOpen');
      onClose();
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
      // Store modal state
      sessionStorage.setItem('modalOpen', 'true');
    } else {
      timeoutId = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = 'unset';
        // Clear modal state
        sessionStorage.removeItem('modalOpen');
      }, ANIMATION_DURATION_MS);
    }

    return () => {
      clearTimeout(timeoutId);
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, onClose]);

  // Render nothing if the modal is closed and the unmount animation is finished
  if (!isMounted && !isOpen) { // Check both to handle the delay
      return null;
  }

  // Use createPortal to render the modal into document.body
  // This avoids CSS stacking context issues
  return createPortal(
    <div
        // Use role="dialog" and aria-modal="true" for accessibility
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        aria-describedby={MODAL_DESCRIPTION_ID}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
            // Apply fade transition to the backdrop
            backgroundColor: 'hsl(var(--background) / 0.8)',
            opacity: isOpen ? 1 : 0,
            transition: `opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
            // pointerEvents ensures backdrop is only clickable when visible/opening
            pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose} // Close modal when clicking the backdrop
    >
      {/* Modal Content */}
      <div
        className="relative flex flex-col w-auto max-w-3xl rounded-lg shadow-lg overflow-hidden" // Added shadow and overflow-hidden
        style={{
          backgroundColor: 'hsl(var(--secondary))',
          // Apply scale and opacity transition to the modal content itself
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0, // Fade content as well
          transition: `transform ${ANIMATION_DURATION_MS}ms ease-in-out, opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <ModalHeader
          composerName={composerName}
          nationality={nationality}
          birthYear={birthYear}
          deathYear={deathYear}
          onClose={onClose}
        />
        <ModalImage imageSrc={imageSrc} altText={composerName} />
        <ModalFooter
          caption={caption}
          copyrightDetails={copyrightDetails}
          sourceUrl={sourceUrl}
        />
      </div>
    </div>,
    document.body // Target element for the portal
  );
}

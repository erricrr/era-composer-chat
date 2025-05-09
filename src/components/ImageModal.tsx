import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
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

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the close button once the component mounts
  useEffect(() => {
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);
  }, []);

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
          tabIndex={0}
        >
          {composerName}
        </h2>
        <div
          className="flex text-sm"
          style={{ color: 'hsl(var(--muted-foreground))' }}
          tabIndex={0}
        >
          {nationality && <span>{nationality}</span>}
          {nationality && years && <span className="mx-2">•</span>}
          {years && <span>{years}</span>}
        </div>
      </div>

      <button
        ref={closeButtonRef}
        onClick={(e) => {
          e.stopPropagation(); // Prevent header click from triggering onClose twice
          onClose();
        }}
        className="p-1 rounded-full transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
    className="flex items-center justify-center p-2"
    style={{ backgroundColor: 'hsl(var(--background))' }}
  >
    <img
      src={imageSrc}
      alt={altText}
      className="max-h-[70vh] w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{ objectFit: 'contain' }}
      tabIndex={0}
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
        tabIndex={0}
      >
        {caption}
      </p>
    )}
    <div className="flex items-center justify-between text-xs">
      <span
        style={{ color: 'hsl(var(--muted-foreground))' }}
        tabIndex={0}
      >
        {copyrightDetails ? (
          <>
            Image by {copyrightDetails.author} via{' '}
            <a
              href={copyrightDetails.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copyrightDetails.source}
            </a>
            , licensed under{' '}
            <a
              href={copyrightDetails.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
  returnFocusRef,
}: ImageModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const copyrightDetails = useMemo(() => getCopyrightAttribution(composerId), [composerId]);

  // Refs for focus trapping
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);
  // Additional ref for the image
  const imageRef = useRef<HTMLImageElement>(null);
  // Additional ref for the close button to ensure proper focus
  const headerCloseButtonRef = useRef<HTMLButtonElement | null>(null);

  // Handle focus management - improved for better cycling
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElementRef.current = document.activeElement;

      // Set a flag to indicate this modal is open - helps with managing multiple modals
      window.sessionStorage.setItem(`modal_${composerId}`, 'open');

      // Focus the close button after a short delay to ensure the DOM is ready
      setTimeout(() => {
        // If we can find the header's close button ref, focus it
        if (modalRef.current) {
          const closeButton = modalRef.current.querySelector('button[aria-label="Close modal"]') as HTMLButtonElement | null;
          if (closeButton) {
            closeButton.focus();
          }
        }
      }, 50);
    } else if (!isOpen && isMounted) {
      // Remove the flag
      window.sessionStorage.removeItem(`modal_${composerId}`);

      // Return focus when modal closes - use a longer delay to ensure proper focus return
      if (returnFocusRef?.current) {
        setTimeout(() => {
          returnFocusRef.current?.focus();
        }, ANIMATION_DURATION_MS + 50);
      }
    }
  }, [isOpen, isMounted, returnFocusRef, composerId]);

  // Handle keyboard events for accessibility - improved focus trapping
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap focus inside the modal
      if (e.key === 'Tab' && modalRef.current) {
        // Get all focusable elements in modal
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, img[tabindex="0"], [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const focusables = Array.from(focusableElements) as HTMLElement[];
        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        // Add the image to the tab order if it's not already included
        if (imageRef.current && !focusables.includes(imageRef.current)) {
          // If image isn't in the tab sequence, make it so
          imageRef.current.tabIndex = 0;
        }

        // Shift+Tab on first element goes to last element
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
        // Tab on last element goes to first element
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
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

  // Update ModalImage component to use the ref
  const ModalImageWithRef = ({ imageSrc, altText }: ModalImageProps) => (
    <div
      className="flex items-center justify-center p-2"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      <img
        ref={imageRef}
        src={imageSrc}
        alt={altText}
        className="max-h-[70vh] w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 z-10"
        style={{ objectFit: 'contain' }}
        tabIndex={0}
      />
    </div>
  );

  // Use createPortal to render the modal into document.body
  // This avoids CSS stacking context issues
  return createPortal(
    <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        aria-describedby={MODAL_DESCRIPTION_ID}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
            backgroundColor: 'hsl(var(--background) / 0.8)',
            opacity: isOpen ? 1 : 0,
            transition: `opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
        }}
        onClick={onClose}
    >
        {/* Modal content */}
        <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()} // Prevent clicks from reaching the backdrop
            className="bg-card rounded-lg overflow-hidden min-w-[300px] shadow-2xl"
            style={{
                transform: isOpen ? 'scale(1)' : 'scale(0.95)',
                opacity: isOpen ? 1 : 0,
                transition: `transform ${ANIMATION_DURATION_MS}ms ease-in-out, opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
                maxWidth: '95vw',
                maxHeight: '95vh',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'hsl(var(--border))',
            }}
        >
            <ModalHeader
                composerName={composerName}
                nationality={nationality}
                birthYear={birthYear}
                deathYear={deathYear}
                onClose={onClose}
            />
            <div className="flex-grow overflow-auto">
                <ModalImageWithRef imageSrc={imageSrc} altText={composerName} />
            </div>
            <ModalFooter
                caption={caption}
                copyrightDetails={copyrightDetails}
                sourceUrl={sourceUrl}
            />
        </div>
    </div>,
    document.body
  );
}

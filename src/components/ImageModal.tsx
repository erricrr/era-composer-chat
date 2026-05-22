import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getCopyrightAttribution, CopyrightDetails } from '@/data/composers';
import { Button } from '@/components/ui/button';
import { CopyrightAttribution } from './CopyrightAttribution';

const ANIMATION_DURATION_MS = 150;
const MODAL_TITLE_ID = 'image-modal-title';
const MODAL_DESCRIPTION_ID = 'image-modal-description';
const CLOSE_BUTTON_SELECTOR = '[data-image-modal-close]';

type ImageModalVariant = 'fullscreen' | 'panel';

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
  /** Fullscreen portal (default) or contained within a split-view panel. */
  variant?: ImageModalVariant;
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
  maxHeightClass?: string;
}

interface ModalFooterProps {
  caption?: string;
  copyrightDetails: CopyrightDetails | null;
  sourceUrl?: string;
  composerName: string;
  compact?: boolean;
}

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
      className="flex justify-between items-center p-3 border-b rounded-t-lg"
      style={{ borderColor: 'hsl(var(--border))' }}
    >
      <div>
        <h2
          id={MODAL_TITLE_ID}
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
          {nationality && years && <span className="mx-2" aria-hidden="true">•</span>}
          {years && <span>{years}</span>}
        </div>
      </div>

      <button
        data-image-modal-close
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Close modal"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
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

const ModalImage: React.FC<ModalImageProps> = ({
  imageSrc,
  altText,
  maxHeightClass = 'max-h-[65vh]',
}) => (
  <div
    className="flex items-center justify-center p-2 w-full h-full"
    style={{ backgroundColor: 'hsl(var(--background))' }}
  >
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <img
        src={imageSrc}
        alt={altText}
        className={`${maxHeightClass} max-w-full w-auto h-auto object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
        style={{
          margin: '0 auto',
          display: 'block',
        }}
      />
    </div>
  </div>
);

const ModalFooter: React.FC<ModalFooterProps> = ({
  caption,
  copyrightDetails,
  sourceUrl,
  composerName,
  compact = false,
}) => (
  <div
    id={MODAL_DESCRIPTION_ID}
    className={compact ? 'py-2 px-2 text-left bg-background dark:bg-secondary' : 'p-3 border-t'}
    style={compact ? undefined : { borderColor: 'hsl(var(--border))' }}
  >
    {caption && (
      <p
        className="text-sm mb-2"
        style={{ color: 'hsl(var(--foreground))' }}
      >
        {caption}
      </p>
    )}
    <div className={`flex items-center justify-between ${compact ? 'text-sm text-muted-foreground' : 'text-xs'}`}>
      <span style={compact ? undefined : { color: 'hsl(var(--muted-foreground))' }}>
        {copyrightDetails ? (
          <CopyrightAttribution copyrightDetails={copyrightDetails} />
        ) : null}
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ color: 'hsl(var(--primary))' }}
          aria-label={`View source for ${composerName}'s portrait (opens in new tab)`}
        >
          Source
        </a>
      )}
    </div>
  </div>
);

function useImageModalBehavior({
  isOpen,
  onClose,
  modalRef,
  returnFocusRef,
  composerId,
  lockBodyScroll,
  trackSession,
}: {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
  composerId: string;
  lockBodyScroll: boolean;
  trackSession: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const previousActiveElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;

      if (trackSession) {
        window.sessionStorage.setItem(`modal_${composerId}`, 'open');
      }

      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector(
          CLOSE_BUTTON_SELECTOR,
        ) as HTMLButtonElement | null;
        closeButton?.focus();
      }, 50);
    } else if (!isOpen && isMounted) {
      if (trackSession) {
        window.sessionStorage.removeItem(`modal_${composerId}`);
      }

      if (returnFocusRef?.current) {
        setTimeout(() => {
          returnFocusRef.current?.focus();
        }, ANIMATION_DURATION_MS + 50);
      } else if (previousActiveElementRef.current instanceof HTMLElement) {
        setTimeout(() => {
          (previousActiveElementRef.current as HTMLElement).focus();
        }, ANIMATION_DURATION_MS + 50);
      }
    }
  }, [isOpen, isMounted, returnFocusRef, composerId, modalRef, trackSession]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, img[tabindex="0"], [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements.length === 0) return;

        const focusables = Array.from(focusableElements).filter(
          (el) => window.getComputedStyle(el as HTMLElement).display !== 'none',
        ) as HTMLElement[];

        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, modalRef]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setIsMounted(true);
      if (lockBodyScroll) {
        document.body.style.overflow = 'hidden';
        sessionStorage.setItem('modalOpen', 'true');
      }
    } else {
      timeoutId = setTimeout(() => {
        setIsMounted(false);
        if (lockBodyScroll) {
          document.body.style.overflow = '';
          sessionStorage.removeItem('modalOpen');
        }
      }, ANIMATION_DURATION_MS);
    }

    return () => {
      clearTimeout(timeoutId);
      if (lockBodyScroll && document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, lockBodyScroll]);

  return isMounted;
}

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
  variant = 'fullscreen',
}: ImageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const copyrightDetails = useMemo(
    () => getCopyrightAttribution(composerId),
    [composerId],
  );
  const isPanel = variant === 'panel';
  const isMounted = useImageModalBehavior({
    isOpen,
    onClose,
    modalRef,
    returnFocusRef,
    composerId,
    lockBodyScroll: !isPanel,
    trackSession: !isPanel,
  });

  if (!isMounted && !isOpen) {
    return null;
  }

  const backdropStyle = {
    backgroundColor: 'hsl(var(--background) / 0.8)',
    opacity: isOpen ? 1 : 0,
    transition: `opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
  };

  const contentStyle = {
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    opacity: isOpen ? 1 : 0,
    transition: `transform ${ANIMATION_DURATION_MS}ms ease-in-out, opacity ${ANIMATION_DURATION_MS}ms ease-in-out`,
  };

  const panelModal = (
    <div
      className="absolute inset-x-0 top-[50px] bottom-0 z-[5] overflow-hidden"
      style={backdropStyle}
      role="dialog"
      aria-label={`Image of ${composerName}`}
      aria-modal="true"
      onClick={onClose}
    >
      <div className="flex h-full items-start justify-center overflow-y-auto px-[5%] py-5">
        <div
          ref={modalRef}
          className="relative z-10 max-w-full overflow-hidden rounded-lg bg-background shadow-xl"
          style={contentStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            data-image-modal-close
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-2 z-20 h-11 w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Close image view"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col">
            <div className="flex items-center justify-center p-2">
              <img
                ref={imageRef}
                src={imageSrc}
                alt={composerName}
                tabIndex={0}
                aria-label={`Full-size image of ${composerName}`}
                className="z-10 max-h-[calc(100vh-220px)] w-auto max-w-full object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
            <ModalFooter
              copyrightDetails={copyrightDetails}
              composerName={composerName}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );

  const fullscreenModal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
      aria-describedby={MODAL_DESCRIPTION_ID}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="flex min-w-[300px] flex-col overflow-hidden rounded-lg bg-card shadow-2xl"
        style={{
          ...contentStyle,
          maxWidth: '95vw',
          width: 'auto',
          maxHeight:
            typeof window !== 'undefined' && window.innerWidth <= 768
              ? 'calc(100svh - 80px)'
              : '85vh',
          marginTop:
            typeof window !== 'undefined' && window.innerWidth <= 768
              ? 80
              : undefined,
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
        <div className="relative flex-grow overflow-auto">
          <ModalImage
            imageSrc={imageSrc}
            altText={`Portrait of ${composerName}`}
          />
        </div>
        <ModalFooter
          caption={caption}
          copyrightDetails={copyrightDetails}
          sourceUrl={sourceUrl}
          composerName={composerName}
        />
      </div>
    </div>
  );

  if (isPanel) {
    return panelModal;
  }

  return createPortal(fullscreenModal, document.body);
}

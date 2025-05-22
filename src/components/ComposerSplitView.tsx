import React, { ReactNode, useState, useEffect } from 'react';
import { Composer, getCopyrightAttribution, CopyrightDetails } from '@/data/composers';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { ComposerImageViewer } from '@/components/ComposerImageViewer';
import { CopyrightAttribution } from './CopyrightAttribution';
import { PortraitImage } from './PortraitImage';

// ContainedImageModal component
function ContainedImageModal({
  isOpen,
  onClose,
  imageSrc,
  composerName,
  composerId,
  returnFocusRef
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
  composerId: string;
  returnFocusRef: React.RefObject<HTMLButtonElement>;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const firstLinkRef = React.useRef<HTMLAnchorElement>(null);
  const secondLinkRef = React.useRef<HTMLAnchorElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Focus the close button when the modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 150);

      // Return focus to the originating button when modal closes
      if (returnFocusRef.current) {
        setTimeout(() => {
          returnFocusRef.current?.focus();
        }, 50);
      }

      return () => clearTimeout(timer);
    }
  }, [isOpen, returnFocusRef]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Close modal on escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trap focus inside modal
      if (e.key === 'Tab') {
        // Get all focusable elements in modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, img[tabindex="0"], [tabindex]:not([tabindex="-1"])'
        ) || [];

        // Convert NodeList to Array and filter out elements with display:none
        const focusable = Array.from(focusableElements).filter(
          el => window.getComputedStyle(el as HTMLElement).display !== 'none'
        ) as HTMLElement[];

        // Add the image to the tab order if it's not already included
        if (imageRef.current && !Array.from(focusable).includes(imageRef.current)) {
          // If image isn't in the tab sequence, make it so
          imageRef.current.tabIndex = 0;
        }

        // If no focusable elements, do nothing
        if (focusable.length === 0) return;

        // If shift+tab on first element, move to last element
        if (e.shiftKey && document.activeElement === focusable[0]) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        }
        // If tab on last element, move to first element
        else if (!e.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Get copyright details
  const copyrightDetails = getCopyrightAttribution(composerId);

  if (!isOpen && !isAnimating) return null;

  return (
    // Full-screen backdrop - positioned to avoid header collision
    <div
      className="absolute inset-x-0 top-[55px] bottom-0 z-10 flex items-start justify-center overflow-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        backgroundColor: 'hsl(var(--background) / 0.8)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
      role="dialog"
      aria-label={`Image of ${composerName}`}
      aria-modal="true"
    >
      {/* Content container with proper spacing */}
      <div
        ref={modalRef}
        className="relative bg-background rounded-lg shadow-xl z-10 overflow-hidden mt-5 max-w-[90%]"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
        }}
      >
        {/* Close button - improved for keyboard access */}
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 h-11 w-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Close image view"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <div className="flex justify-center items-center p-2">
            <img
              ref={imageRef}
              src={imageSrc}
              alt={composerName}
              className="w-auto max-w-full max-h-[calc(100vh-220px)] object-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 z-10"
              tabIndex={0}
              aria-label={`Full-size image of ${composerName}`}
            />
          </div>

          {/* Footer */}
          <div className="py-1 px-2 text-left bg-background dark:bg-secondary">
            <div
              className="text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              tabIndex={0}
            >
              {copyrightDetails ? (
                <CopyrightAttribution
                  copyrightDetails={copyrightDetails}
                  firstLinkRef={firstLinkRef}
                  secondLinkRef={secondLinkRef}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComposerSplitViewProps {
  composer: Composer;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  isActiveChatsOpen?: boolean;
}

export function ComposerSplitView({ composer, isOpen, onClose, children, isActiveChatsOpen = false }: ComposerSplitViewProps) {
  const isMobile = useIsMobile();

  // SIMPLIFIED: Don't use localStorage at all, just a simple state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  // Add ref to image button for focus management
  const imageButtonRef = React.useRef<HTMLButtonElement>(null);
  // Ref for header composer name focus management
  const nameButtonRef = React.useRef<HTMLDivElement>(null);

  // IMPORTANT: This effect ensures the image modal is ALWAYS closed when the split view closes
  useEffect(() => {
    if (!isOpen) {
      setImageModalOpen(false);
    }
  }, [isOpen]);

  // Add keyboard listener for Escape to close split view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Clean early return - don't render anything when closed
  if (!isOpen) return null;

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    // Ensure focus returns to the image button
    setTimeout(() => {
      imageButtonRef.current?.focus();
    }, 50);
  };

  const handleOpenImageModal = () => {
    setImageModalOpen(true);
  };

  const composerContent = (
    // Add relative positioning context for the modal
    <div className="relative h-full flex flex-col">
      {/* Background Music Notes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <MusicNoteDecoration />
      </div>

      {/* Fixed Header - Now outside ScrollArea */}
      <div
        className="relative flex items-center justify-center border-b py-7 bg-primary-foreground backdrop-blur-sm shadow-md z-10 flex-shrink-0 group transition-colors w-full cursor-pointer focus-ring-inset focus:rounded-none ComposerSplitView-header"
        tabIndex={0}
        role="button"
        aria-label="Close split view"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            ref={nameButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer font-bold font-serif text-lg md:text-xl truncate max-w-[calc(100%-5rem)] px-4 transition-colors"
          >
            {composer.name}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close split view"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-4 rounded-full hover:bg-primary/20 transition-all duration-200 group-hover:bg-primary/20 w-11 h-11 flex items-center justify-center text-foreground/70 hover:text-foreground/90 z-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`space-y-4 md:space-y-6 ${
            isMobile
              ? 'p-3' // Compact padding for mobile
              : isActiveChatsOpen
                ? 'p-3 md:p-4'
                : 'p-4 md:p-6'
          }`}>
            <div className={`flex flex-col items-center text-center ${isMobile ? 'space-y-2' : 'space-y-3'}`}>
              <button
                ref={imageButtonRef}
                type="button"
                onClick={handleOpenImageModal}
                className={`transform transition-transform duration-200 hover:scale-105 appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:z-10 relative cursor-pointer rounded-full overflow-hidden border-2 border-primary flex-shrink-0 ${
                  isMobile
                    ? isActiveChatsOpen
                      ? 'w-32 h-32'
                      : 'w-48 h-48'
                    : isActiveChatsOpen
                      ? 'w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48'
                      : 'w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64'
                }`}
                aria-label={`View full image of ${composer.name}`}
              >
                <PortraitImage
                  composerId={composer.id}
                  src={composer.imageUrl}
                  alt={composer.name}
                />
              </button>

              {/* Composer info (nationality, years, era badges) */}
              <div
                tabIndex={0}
                className="focus-ring-inset focus:rounded-none flex flex-col md:flex-col items-center gap-2 mt-2 text-center"
              >
                <span className={`text-muted-foreground ${
                  isMobile
                    ? 'text-sm'
                    : isActiveChatsOpen
                      ? 'text-xs'
                      : 'text-sm md:text-base'
                }`}>
                  {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
                </span>
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.isArray(composer.era) ? (
                    composer.era.map((era, idx) => (
                      <Badge
                        key={era + idx}
                        variant="badge"
                        className={
                          isMobile
                            ? 'text-xs px-2 py-0.5'
                            : isActiveChatsOpen
                              ? 'text-[10px] px-1.5 py-0.5'
                              : ''
                        }
                      >
                        {era}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      variant="badge"
                      className={
                        isMobile
                          ? 'text-xs px-2 py-0.5'
                          : isActiveChatsOpen
                            ? 'text-[10px] px-1.5 py-0.5'
                            : ''
                      }
                    >
                      {composer.era}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div
              tabIndex={0}
              className="focus-ring-inset focus:rounded-none space-y-4 md:space-y-6 max-w-prose mx-auto"
            >
              <div>
                <p className={`text-foreground/90 ${
                  isMobile
                    ? 'text-sm'
                    : isActiveChatsOpen
                      ? 'text-xs md:text-sm'
                      : 'text-sm md:text-base'
                }`}>
                  {composer.longBio}
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-2 ${
                  isMobile
                    ? 'text-base'
                    : isActiveChatsOpen
                      ? 'text-sm md:text-base'
                      : 'text-base md:text-lg'
                }`}>
                  Notable Works
                </h3>
                <ul className="list-disc pl-5 mb-5 space-y-1">
                  {composer.famousWorks.map((work, index) => (
                    <li
                      key={index}
                      className={`text-foreground/80 ${
                        isMobile
                          ? 'text-sm'
                          : isActiveChatsOpen
                            ? 'text-xs md:text-sm'
                            : 'text-sm md:text-base'
                      }`}>
                      {work}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Scroll shadow for all screen sizes */}
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-background to-transparent z-10" />
        </ScrollArea>
      </div>

      {/* Conditional rendering of the image modal */}
      {imageModalOpen && (
        <ContainedImageModal
          isOpen={true}
          onClose={handleCloseImageModal}
          imageSrc={composer.imageUrl}
          composerName={composer.name}
          composerId={composer.id}
          returnFocusRef={imageButtonRef}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-40"
        style={{
          right: isActiveChatsOpen ? '16rem' : 0,
          transition: 'right 200ms ease-in-out'
        }}
      >
        <ResizablePanelGroup
          direction="vertical"
          className="h-full transition-opacity duration-200 ease-in-out"
        >
          {/* Composer Panel */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            maxSize={60}
            className={`bg-secondary/50 backdrop-blur-sm flex flex-col transition-all duration-200 ease-in-out p-0 overflow-hidden ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {composerContent}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={`transition-opacity duration-200 ease-in-out ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel */}
          <ResizablePanel
            defaultSize={60}
            minSize={40}
            maxSize={70}
            className={`bg-background transition-all duration-200 ease-in-out ${
              isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
            id="chat-panel-mobile"
            aria-label="Chat Panel"
          >
            <div className="h-full overflow-auto">
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-40"
      style={{
        right: isActiveChatsOpen ? '16rem' : 0,
        transition: 'right 200ms ease-in-out'
      }}
    >
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-200 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
      </div>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className={`h-full w-full transition-all duration-200 ease-in-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Composer Panel */}
        <ResizablePanel
          defaultSize={isMobile ? 40 : 38}
          minSize={isMobile ? 30 : 35}
          maxSize={isMobile ? 60 : 65}
          className="bg-primary-foreground/50 backdrop-blur-sm flex flex-col p-0 overflow-hidden"
          id={isMobile ? "composer-panel-mobile" : "composer-panel-desktop"}
          aria-label="Composer Panel"
          order={1}
        >
          {composerContent}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          className={`transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          aria-controls={isMobile ? "composer-panel-mobile chat-panel-mobile" : "composer-panel-desktop chat-panel-desktop"}
        />

        {/* Chat Panel */}
        <ResizablePanel
          defaultSize={isMobile ? 60 : 62}
          minSize={isMobile ? 40 : 35}
          maxSize={isMobile ? 70 : 65}
          className="bg-background"
          id={isMobile ? "chat-panel-mobile" : "chat-panel-desktop"}
          aria-label="Chat Panel"
          order={2}
        >
          <div className="h-full overflow-auto">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

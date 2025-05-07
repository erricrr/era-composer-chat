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

// ContainedImageModal component
function ContainedImageModal({
  isOpen,
  onClose,
  imageSrc,
  composerName,
  composerId
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
  composerId: string;
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
    >
      {/* Content container with proper spacing */}
      <div
        className="relative bg-background rounded-lg shadow-xl z-10 overflow-hidden mt-5 max-w-[90%]"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
        }}
      >
        {/* Close button - only visible on hover */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <div className="flex justify-center items-center">
            <img
              src={imageSrc}
              alt={composerName}
              className="w-auto max-w-full max-h-[calc(100vh-220px)] object-contain"
            />
          </div>

          {/* Footer */}
          <div className="py-1 px-2 text-left bg-background dark:bg-secondary">
            <div className="text-xs text-muted-foreground">
              {copyrightDetails ? (
                <>
                  Image by {copyrightDetails.author} via{' '}
                  <a href={copyrightDetails.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    {copyrightDetails.source}
                  </a>
                  , licensed under{' '}
                  <a href={copyrightDetails.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    {copyrightDetails.license}
                  </a>
                </>
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

  // IMPORTANT: This effect ensures the image modal is ALWAYS closed when the split view closes
  useEffect(() => {
    if (!isOpen) {
      setImageModalOpen(false);
    }
  }, [isOpen]);

  // Clean early return - don't render anything when closed
  if (!isOpen) return null;

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
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
  onClick={onClose}
  className="relative flex items-center justify-center border-b py-7 bg-secondary backdrop-blur-sm shadow-md z-10 flex-shrink-0 cursor-pointer group hover:bg-secondary/80 transition-colors"
>
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <h2 className="font-bold font-serif text-lg md:text-xl pointer-events-none truncate max-w-[calc(100%-5rem)] px-4">
      {composer.name}
    </h2>
  </div>
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => {
      e.stopPropagation();
      onClose();
    }}
    className="absolute right-4 rounded-full hover:bg-primary/20 transition-all duration-200 group-hover:bg-primary/20 w-8 h-8 text-foreground/70 hover:text-foreground/90"
  >
    <X className="h-4 w-4" />
  </Button>
</div>


      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
  <ScrollArea className="h-full">
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          onClick={() => setImageModalOpen(true)}
          className="cursor-pointer w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full overflow-hidden border-2 border-primary flex-shrink-0 transition-transform duration-300 ease-in-out hover:scale-[1.03]"
        >
          <img
            src={composer.imageUrl}
            alt={composer.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Composer info (nationality, years, era badges) */}
        <div className="flex flex-col md:flex-col items-center gap-2 mt-2 text-center">
          <span className="text-sm md:text-base text-muted-foreground">
            {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
          </span>
          <div className="flex flex-wrap justify-center gap-1">
            {Array.isArray(composer.era)
              ? composer.era.map((era, idx) => (
                  <Badge key={era + idx} variant="badge">
                    {era}
                  </Badge>
                ))
              : <Badge variant="badge">{composer.era}</Badge>}
          </div>
        </div>
      </div>

            <div className="space-y-4 md:space-y-6 max-w-prose mx-auto">
              <div>
                <p className="text-sm md:text-base text-foreground/90">{composer.longBio}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-base md:text-lg">Notable Works</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {composer.famousWorks.map((work, index) => (
                    <li key={index} className="text-sm md:text-base text-foreground/80">{work}</li>
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
          transition: 'right 200ms ease-out'
        }}
      >
        <ResizablePanelGroup
          direction="vertical"
          className="h-full transition-opacity duration-300 ease-in-out"
        >
          {/* Composer Panel */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            maxSize={60}
            className={`bg-secondary/50 backdrop-blur-sm flex flex-col transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0 pointer-events-none'
            }`}
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {composerContent}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={`transition-opacity duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel */}
          <ResizablePanel
            defaultSize={60}
            minSize={40}
            maxSize={70}
            className={`bg-background transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
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
        transition: 'right 200ms ease-out'
      }}
    >
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className={`h-full w-full transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
        }`}
      >
        {/* Composer Panel */}
        <ResizablePanel
          defaultSize={isMobile ? 40 : 38}
          minSize={isMobile ? 30 : 35}
          maxSize={isMobile ? 60 : 65}
          className="bg-secondary/50 backdrop-blur-sm flex flex-col"
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

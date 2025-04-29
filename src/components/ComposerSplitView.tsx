import React, { ReactNode, useState, useEffect } from 'react';
import { Composer } from '@/data/composers';
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
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  composerName: string;
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

  if (!isOpen && !isAnimating) return null;

  return (
    // Full-screen backdrop - positioned to avoid header collision
    <div
      className="absolute inset-x-0 top-[73px] bottom-0 z-5 flex items-start justify-center overflow-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        backgroundColor: 'hsl(var(--background) / 0.8)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
    >
  {/* Content container with proper spacing */}
<div
  className="relative bg-background rounded-lg shadow-xl z-10 overflow-hidden mt-5 max-w-[90%] group"
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
    className="absolute right-2 top-2 z-20 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
  <div className="py-1 px-2 text-center bg-background dark:bg-secondary">
    <div className="text-xs text-muted-foreground">
      Image copyright
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
}

export function ComposerSplitView({ composer, isOpen, onClose, children }: ComposerSplitViewProps) {
  const isMobile = useIsMobile();

  // Construct a unique key for localStorage based on the composer's ID
  const localStorageKey = `splitViewImageModalOpen_${composer.id}`;

  // Initialize state from localStorage or default to false
  const [imageModalOpen, setImageModalOpen] = useState(() => {
    const storedValue = localStorage.getItem(localStorageKey);
    return storedValue ? JSON.parse(storedValue) : false;
  });

  // Effect to update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(imageModalOpen));
  }, [imageModalOpen, localStorageKey]);

  if (!isOpen) return null;

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
        className="relative flex justify-between items-center border-b p-4 bg-secondary backdrop-blur-sm shadow-sm z-10 flex-shrink-0 cursor-pointer group hover:bg-secondary/80 transition-colors"
      >
        <h2 className="font-bold font-serif text-xl">
          {composer.name}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double firing of close event
            onClose();
          }}
          className="rounded-full hover:bg-primary/20 transition-colors group-hover:bg-primary/20"
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
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm md:text-base text-muted-foreground">
                  {composer.nationality}, {composer.birthYear}-{composer.deathYear || 'present'}
                </span>
                <Badge variant="badge">
                  {Array.isArray(composer.era) ? composer.era.join(' / ') : composer.era}
                </Badge>
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
        </ScrollArea>
      </div>

      {/* Contained Image Modal - Now inside relative parent */}
      <ContainedImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageSrc={composer.imageUrl}
        composerName={composer.name}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40">
        <ResizablePanelGroup
          direction="vertical"
          className={`h-full transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}`}
        >
          {/* Composer Panel */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            maxSize={60}
            className={`bg-secondary/50 backdrop-blur-sm flex flex-col transition-all duration-300 ease-in-out ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {composerContent}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel */}
          <ResizablePanel
            defaultSize={60}
            minSize={40}
            maxSize={70}
            className={`transition-all duration-300 ease-in-out ${
              isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            id="chat-panel-mobile"
            aria-label="Chat Panel"
          >
            <div className="h-full bg-background overflow-auto">
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 w-screen">
      <div
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className={`h-full w-screen transition-all duration-300 ease-out ${
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

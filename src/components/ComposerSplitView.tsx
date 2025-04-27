import React, { ReactNode, useState } from 'react';
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
    // Backdrop - positioned absolutely below header within parent, lower z-index
    <div
      className="absolute inset-x-0 top-[64px] bottom-0 z-5 flex items-center justify-center p-4 shadow-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        backgroundColor: 'hsl(var(--background) / 0.8)',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 150ms ease-in-out',
      }}
    >
      {/* Image container - centered, consistent rounding */}
      <div
        className="relative max-w-[90%] max-h-[90%] group rounded-lg overflow-hidden shadow-xl z-10"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
        style={{
          backgroundColor: 'hsl(var(--background))', // Ensure bg for rounded corners
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 150ms ease-in-out',
        }}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-1 top-1 z-10 h-8 w-8 rounded-full bg-background/50 hover:bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Image */}
        <div className="relative flex items-center justify-center">
          <img
            src={imageSrc}
            alt={composerName}
            className="block max-h-[calc(100vh-120px)] max-w-full w-auto h-auto object-contain"
          />

          {/* Gradient overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"
          />

          {/* Copyright */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-center pointer-events-none">
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
  const [imageModalOpen, setImageModalOpen] = useState(false);

  if (!isOpen) return null;

  const composerContent = (
    // Add relative positioning context for the modal
    <div className="relative h-full flex flex-col">
      {/* Background Music Notes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <MusicNoteDecoration />
      </div>

      {/* Fixed Header - Now outside ScrollArea */}
      <div className="relative flex justify-between items-center p-4 bg-secondary backdrop-blur-sm shadow-sm z-10 flex-shrink-0">
        <h2 className="text-2xl font-bold font-serif">{composer.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-primary/20"
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
                className="cursor-pointer w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full overflow-hidden border-2 border-primary flex-shrink-0"
              >
                <img
                  src={composer.image}
                  alt={composer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm md:text-base text-muted-foreground">
                  {composer.country}, {composer.years}
                </span>
                <Badge variant="badge">
                  {composer.era}
                </Badge>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 max-w-prose mx-auto">
              <div>
                <p className="text-sm md:text-base text-foreground/90">{composer.bio}</p>
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
        imageSrc={composer.image}
        composerName={composer.name}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Composer Panel on Top */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}     // Minimum 30% of the screen height
            maxSize={60}     // Maximum 60% of the screen height
            className="bg-secondary/50 backdrop-blur-sm flex flex-col"
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {composerContent}
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="h-2 bg-secondary/10 hover:bg-secondary/20 transition-colors"
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel on Bottom */}
          <ResizablePanel
            defaultSize={60}
            minSize={40}     // Minimum 40% of the screen height
            maxSize={70}     // Maximum 70% of the screen height
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
    <div className="fixed inset-0 z-40">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Composer Image Panel (Left) */}
        <ResizablePanel
          defaultSize={38}
          minSize={35}
          maxSize={65}
          className="bg-secondary/50 backdrop-blur-sm flex flex-col"
          id="composer-panel-desktop"
          aria-label="Composer Panel"
          order={1}
        >
          {composerContent}
        </ResizablePanel>

        <ResizableHandle
          withHandle
          aria-controls="composer-panel-desktop chat-panel-desktop"
        />

        {/* Chat Panel (Right) */}
        <ResizablePanel
          defaultSize={62}
          minSize={35}
          maxSize={65}
          id="chat-panel-desktop"
          aria-label="Chat Panel"
          order={2}
        >
          <div className="h-full bg-background overflow-auto">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

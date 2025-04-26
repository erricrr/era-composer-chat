import { Composer } from '@/data/composers';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';
import { MusicNoteDecoration } from '@/components/MusicNoteDecoration';
import { ComposerImageViewer } from '@/components/ComposerImageViewer';


interface ComposerSplitViewProps {
  composer: Composer;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function ComposerSplitView({ composer, isOpen, onClose, children }: ComposerSplitViewProps) {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const composerContent = (
    <>
      {/* Fixed Header */}
      <div className="flex justify-between items-start p-4 pb-2 bg-secondary/50 backdrop-blur-sm shadow-sm">
        <h2 className="text-2xl font-bold font-serif px-2">{composer.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-primary/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1 w-full">
      <MusicNoteDecoration />
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">

            <ComposerImageViewer
              composer={composer}
              size="xl"
              className="w-32 h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 xl:w-56 xl:h-56"
              allowModalOnDesktop
            />
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
    </>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40">
        <ResizablePanelGroup direction="vertical" className="h-full">
          {/* Composer Panel on Top */}
          <ResizablePanel
            defaultSize={50}
            minSize={10} // Lowered minSize
            // maxSize can usually be omitted unless you have specific upper bounds
            className="bg-secondary/50 backdrop-blur-sm flex flex-col"
            // Optional: Add id and aria-label for better accessibility context
            id="composer-panel-mobile"
            aria-label="Composer Panel"
          >
            {/* Add overflow handling if content might break at small sizes */}
            <div className="flex-1 overflow-auto">
              {composerContent}
            </div>
          </ResizablePanel>

          <ResizableHandle
            withHandle
            // Optional: Add aria-controls for better accessibility
            aria-controls="composer-panel-mobile chat-panel-mobile"
          />

          {/* Chat Panel on Bottom */}
          <ResizablePanel
            defaultSize={50}
            minSize={10} // Lowered minSize
            id="chat-panel-mobile"
            aria-label="Chat Panel"
          >
            {/* Add overflow handling */}
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
          defaultSize={38} // Initial size (valid within 35-65)
          minSize={35}     // *** UPDATED: Minimum 35% (100 - 65) ***
          maxSize={65}     // *** UPDATED: Maximum 65% ***
          className="bg-secondary/50 backdrop-blur-sm flex flex-col"
          id="composer-panel-desktop"
          aria-label="Composer Panel"
          order={1}        // Optional: Explicitly set order for clarity/tab order
        >
           <div className="flex-1 overflow-auto">
             {composerContent}
           </div>
        </ResizablePanel>

        <ResizableHandle
          withHandle
          aria-controls="composer-panel-desktop chat-panel-desktop"
        />

        {/* Chat Panel (Right) */}
        <ResizablePanel
          defaultSize={62} // Initial size (valid within 35-65)
          minSize={35}     // *** ADDED: Minimum 35% (100 - 65) ***
          maxSize={65}     // *** ADDED: Maximum 65% ***
          id="chat-panel-desktop"
          aria-label="Chat Panel"
          order={2}        // Optional: Explicitly set order
        >
           <div className="h-full bg-background overflow-auto">
            {children}
           </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

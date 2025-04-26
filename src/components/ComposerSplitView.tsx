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
      {/* Background Music Notes */}
      <div className="absolute inset-0 overflow-hidden">
        <MusicNoteDecoration />
      </div>

      {/* Fixed Header - Now outside ScrollArea */}
      <div className="relative flex justify-between items-start p-4 pb-2 bg-secondary backdrop-blur-sm shadow-sm z-10">
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

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <ComposerImageViewer
                composer={composer}
                size="xl"
                className="w-40 h-40 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72"
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
      </div>
    </>
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

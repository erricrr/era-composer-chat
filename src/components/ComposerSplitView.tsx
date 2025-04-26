import { Composer } from '@/data/composers';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

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
      <div className="flex justify-between items-start p-4 pb-2 bg-secondary shadow-sm backdrop-blur-sm">
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
      <ScrollArea className="flex-1">
        <div className="p-6 pt-4 space-y-6">
          <div className={`relative rounded-lg overflow-hidden border-2 border-primary mx-auto ${
            isMobile ? 'w-48 h-48' : 'w-full aspect-square'
          }`}>
            <img
              src={composer.image}
              alt={composer.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground">
                {composer.country}, {composer.years}
              </span>
              <Badge variant="badge">
                {composer.era}
              </Badge>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-foreground/90">{composer.bio}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Notable Works</h3>
              <ul className="list-disc pl-5 space-y-1">
                {composer.famousWorks.map((work, index) => (
                  <li key={index} className="text-sm text-foreground/80">{work}</li>
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
          <ResizablePanel defaultSize={50} minSize={30} className="bg-secondary/50 backdrop-blur-sm flex flex-col">
            {composerContent}
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Chat Panel on Bottom */}
          <ResizablePanel defaultSize={50} minSize={40}>
            <div className="h-full bg-background">
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
        {/* Composer Image Panel */}
        <ResizablePanel defaultSize={40} minSize={30} maxSize={50} className="bg-secondary/50 backdrop-blur-sm flex flex-col">
          {composerContent}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Chat Panel */}
        <ResizablePanel defaultSize={60}>
          <div className="h-full bg-background">
            {children}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

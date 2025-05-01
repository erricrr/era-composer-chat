import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';
import { useCallback, useEffect } from 'react';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer, options?: { source?: string }) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
  isOpen?: boolean;
  shouldScrollToComposer: boolean;
  onScrollComplete: () => void;
}

export function ComposerList({
  era,
  onSelectComposer,
  selectedComposer,
  onStartChat,
  isOpen = false,
  shouldScrollToComposer,
  onScrollComplete
}: ComposerListProps) {
  console.log("[List] Rendering for era:", era, "Selected:", selectedComposer?.name, "ShouldScroll:", shouldScrollToComposer);
  const allComposers = getComposersByEra(era);

  // Simple selection handler
  const handleComposerSelect = useCallback((composer: Composer) => {
    console.log("[List] handleComposerSelect called for:", composer.name);
    try {
      onSelectComposer(composer, { source: 'list' });
      console.log("[List] onSelectComposer called successfully");
    } catch (error) {
      console.error("[List] Error calling onSelectComposer:", error);
    }
  }, [onSelectComposer]);

  // Effect to scroll selected composer into view *if needed*
  useEffect(() => {
    if (selectedComposer && shouldScrollToComposer) {
      console.log(`[List] Scroll triggered for ${selectedComposer.name}`);
      let scrolled = false;
      setTimeout(() => {
        const desktopElement = document.getElementById(`composer-card-${selectedComposer.id}`);
        if (desktopElement) {
          console.log(`[List] Scrolling desktop to ${selectedComposer.name}`);
          desktopElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          scrolled = true;
        }

        const mobileElement = document.getElementById(`mobile-composer-card-${selectedComposer.id}`);
        if (mobileElement) {
          console.log(`[List] Scrolling mobile to ${selectedComposer.name}`);
          mobileElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          scrolled = true;
        }

        if (scrolled) {
            console.log("[List] Calling onScrollComplete");
            onScrollComplete();
        }
      }, 0);
    }
  }, [selectedComposer, shouldScrollToComposer, onScrollComplete]);

  return (
    <div className="w-full mt-5 relative" style={{ height: "65vh" }}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 md:gap-5 h-full">
        <div className="overflow-hidden h-full flex flex-col">
          <div className="md:hidden flex-shrink-0">
            <ScrollArea className="w-full h-full">
              <div className="inline-flex h-full items-center">
                {allComposers.map((composer) => (
                  <div
                    key={composer.id}
                    id={`mobile-composer-card-${composer.id}`}
                    className="flex-shrink-0 w-56 h-full"
                  >
                    <ComposerCard
                      composer={composer}
                      onClick={() => handleComposerSelect(composer)}
                      isSelected={selectedComposer?.id === composer.id}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="hidden md:flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="flex flex-col">
                {allComposers.map((composer) => (
                  <div key={composer.id} id={`composer-card-${composer.id}`}>
                    <ComposerCard
                      composer={composer}
                      onClick={() => handleComposerSelect(composer)}
                      isSelected={selectedComposer?.id === composer.id}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>

        {selectedComposer && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col border-b">
              <ScrollArea className="flex-1 min-h-0">
                <div className="px-3 md:px-4">
                  <div className="flex items-start md:items-center space-x-3 md:space-x-6 mb-3 md:mb-4">
                    <ComposerImageViewer
                      composer={selectedComposer}
                      allowModalOnDesktop={true}
                      className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold font-serif break-words">
                        {selectedComposer.name}
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-1">
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {selectedComposer.nationality}, {selectedComposer.birthYear}-{selectedComposer.deathYear || 'present'}
                        </span>
                        <div className="flex flex-wrap gap-1 md:ml-2">
                          {selectedComposer.era.map((era, idx) => (
                            <Badge key={era + idx} variant="badge" className="text-xs">{era}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <p className="text-sm md:text-base text-foreground/90">{selectedComposer.shortBio}</p>
                    <div>
                      <h4 className="font-semibold mb-1 md:mb-2 text-base md:text-lg">Notable Works</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                          <li key={index} className="text-sm md:text-base text-foreground/80">{work}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <div className="flex-shrink-0 h-14 md:h-16 px-3 md:px-4 py-2 bg-background">
              <Button
                onClick={() => {
                  if (selectedComposer && isComposerInPublicDomain(selectedComposer)) {
                    onStartChat(selectedComposer);
                  }
                }}
                disabled={!selectedComposer || !isComposerInPublicDomain(selectedComposer)}
                className={`
                  w-full h-full text-sm md:text-base transition-transform duration-300
                  ${
                    selectedComposer && isComposerInPublicDomain(selectedComposer)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                      : 'bg-muted text-muted-foreground opacity-70 cursor-not-allowed'
                  }
                `}
                title={selectedComposer && isComposerInPublicDomain(selectedComposer) ? `Chat with ${getLastName(selectedComposer.name)}` : 'Chat unavailable due to rights restrictions'}
              >
                {selectedComposer && isComposerInPublicDomain(selectedComposer)
                  ? `Start a Chat with ${getLastName(selectedComposer.name)}`
                  : 'Chat unavailable due to rights restrictions'}
              </Button>
            </div>
          </div>
        )}
        {!selectedComposer && (
          <div className="hidden md:flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            Select a composer from the list to see their details and chat availability.
          </div>
        )}
      </div>
    </div>
  );
}

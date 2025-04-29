import { Composer, Era, getComposersByEra, getLastName, isComposerInPublicDomain } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComposerImageViewer } from './ComposerImageViewer';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
  isOpen?: boolean;
}

export function ComposerList({
  era,
  onSelectComposer,
  selectedComposer,
  onStartChat,
  isOpen = false
}: ComposerListProps) {
  const composers = getComposersByEra(era);

  return (
    <div className="w-full mt-0">
      <div
        className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-5 md:gap-6 lg:gap-8"
        style={{ height: "65vh" }}
      >
        {/* Left side - Composers list */}
        <div className="bg-secondary/80 rounded-lg overflow-hidden h-full">
          {/* Mobile view */}
          <div className="md:hidden rounded-lg bg-secondary/80 backdrop-blur-sm h-[150px]">
            <ScrollArea className="h-[150px]">
              <div className="flex space-x-4 px-3 py-3">
                {composers.map((composer) => (
                  <div
                    key={composer.id}
                    className="flex-shrink-0 w-60"
                  >
                    <ComposerCard
                      composer={composer}
                      onClick={onSelectComposer}
                      isSelected={selectedComposer?.id === composer.id}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block h-full">
            <ScrollArea className="h-full">
              <div className="flex flex-col space-y-2 p-[10px]">
                {composers.map((composer) => (
                  <ComposerCard
                    key={composer.id}
                    composer={composer}
                    onClick={onSelectComposer}
                    isSelected={selectedComposer?.id === composer.id}
                  />
                ))}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>

        {/* Right side - Biography with button */}
        {selectedComposer && (
          <div className="relative h-[calc(65vh-6rem)] md:h-full overflow-hidden">
            <div className="absolute inset-0 bottom-14 md:bottom-16 md:pt-0 pt-5">
              <ScrollArea className="h-full">
                <div className="p-3 md:p-4">
                  {/* Header */}
                  <div className="flex items-start md:items-center space-x-3 md:space-x-6 mb-3 md:mb-4">
                    <ComposerImageViewer
                      composer={selectedComposer}
                      allowModalOnDesktop={true}
                      className="w-16 h-16 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-2xl lg:text-3xl font-bold font-serif truncate">
                        {selectedComposer.name}
                      </h3>
                      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mt-1">
                        <span className="text-xs md:text-sm text-muted-foreground">
                          {selectedComposer.nationality}, {selectedComposer.birthYear}-{selectedComposer.deathYear || 'present'}
                        </span>
                        <div className="flex flex-wrap gap-1 md:ml-2">
                          {Array.isArray(selectedComposer.era)
                            ? selectedComposer.era.map((era, idx) => (
                                <Badge key={era + idx} variant="badge" className="text-xs">{era}</Badge>
                              ))
                            : <Badge variant="badge" className="text-xs">{selectedComposer.era}</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Biography and works */}
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

            {/* Chat button */}
            <div className="absolute bottom-0 left-0 right-0 h-14 md:h-16 px-3 md:px-4 py-2 bg-background border-t">
              <Button
                onClick={() => {
                  if (isComposerInPublicDomain(selectedComposer)) {
                    onStartChat(selectedComposer);
                  }
                }}
                disabled={!isComposerInPublicDomain(selectedComposer)}
                className={`
                  w-full h-full text-sm md:text-base transition-transform duration-300
                  ${
                    isComposerInPublicDomain(selectedComposer)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]'
                      : 'bg-muted text-muted-foreground opacity-70 cursor-not-allowed'
                  }
                `}
                title={isComposerInPublicDomain(selectedComposer) ? `Chat with ${getLastName(selectedComposer.name)}` : 'Chat unavailable due to rights restrictions'}
              >
                {isComposerInPublicDomain(selectedComposer)
                  ? `Start a Chat with ${getLastName(selectedComposer.name)}`
                  : 'Chat unavailable due to rights restrictions'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

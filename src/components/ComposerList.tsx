
import { Composer, Era, getComposersByEra } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
}

export function ComposerList({ era, onSelectComposer, selectedComposer, onStartChat }: ComposerListProps) {
  const composers = getComposersByEra(era);

  return (
    <div className="w-full mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        {/* Left side - Scrolling composers */}
        <ScrollArea className="w-full bg-card dark:bg-sidebar/40 rounded-lg p-4">
          <div className="flex flex-row lg:flex-col space-x-4 lg:space-x-0 lg:space-y-4 w-max lg:w-full pb-4">
            {composers.map((composer) => (
              <ComposerCard 
                key={composer.id} 
                composer={composer} 
                onClick={onSelectComposer}
                isSelected={selectedComposer?.id === composer.id}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="lg:hidden" />
          <ScrollBar orientation="vertical" className="hidden lg:flex" />
        </ScrollArea>

        {/* Right side - Biography */}
        {selectedComposer && (
          <div className="bg-card dark:bg-sidebar/40 rounded-lg p-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={selectedComposer.image}
                alt={selectedComposer.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-primary/30"
              />
              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold font-serif">{selectedComposer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedComposer.years} • {selectedComposer.country}
                </p>
              </div>
              
              <ScrollArea className="h-[200px] w-full rounded-md">
                <p className="text-sm text-foreground/90 mb-4">{selectedComposer.bio}</p>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Notable Works:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                      <li key={index} className="text-sm text-foreground/80">{work}</li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>

              <Button 
                onClick={() => onStartChat(selectedComposer)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

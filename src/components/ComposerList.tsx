
import { Composer, Era, getComposersByEra } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

interface ComposerListProps {
  era: Era;
  onSelectComposer: (composer: Composer) => void;
  selectedComposer: Composer | null;
  onStartChat: (composer: Composer) => void;
}

export function ComposerList({
  era,
  onSelectComposer,
  selectedComposer,
  onStartChat
}: ComposerListProps) {
  const composers = getComposersByEra(era);

  useEffect(() => {
    if (!selectedComposer && composers.length > 0) {
      onSelectComposer(composers[0]);
    }
  }, [composers, selectedComposer, onSelectComposer]);

  return (
    <div className="w-full mt-4">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        {/* Left side - Scrolling composers */}
        <ScrollArea className="w-full bg-card dark:bg-sidebar/40 rounded-lg p-3">
          <div className="flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-4 w-max md:w-full pb-4">
            {composers.map(composer => <ComposerCard key={composer.id} composer={composer} onClick={onSelectComposer} isSelected={selectedComposer?.id === composer.id} />)}
          </div>
          <ScrollBar orientation="horizontal" className="md:hidden" />
          <ScrollBar orientation="vertical" className="hidden md:flex" />
        </ScrollArea>

        {/* Right side - Biography with horizontal layout */}
        {selectedComposer && (
          <div className="bg-card dark:bg-sidebar/40 rounded-lg p-4 flex flex-col max-h-[70vh] md:max-h-none overflow-y-auto">
            {/* Header with horizontal layout */}
            <div className="flex items-center space-x-6 mb-6">
              <img src={selectedComposer.image} alt={selectedComposer.name} className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 flex-shrink-0" />
              <div className="flex flex-col items-start">
                <h3 className="text-2xl font-bold font-serif">{selectedComposer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {selectedComposer.country}, {selectedComposer.years}
                  </span>
                  <Badge variant="secondary" className="ml-2">
                    {era === Era.Modern ? '20th-21st Century' : era} Era
                  </Badge>
                </div>
              </div>
            </div>

            {/* Biography and works */}
            <ScrollArea className="flex-grow mb-6 overflow-y-auto">
              <p className="text-sm text-foreground/90 mb-6">{selectedComposer.bio}</p>
              <div>
                <h4 className="font-semibold mb-2">Notable Works:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedComposer.famousWorks.slice(0, 3).map((work, index) => <li key={index} className="text-sm text-foreground/80">{work}</li>)}
                </ul>
              </div>
            </ScrollArea>

            {/* Start Conversation button with full width and bottom positioning */}
            <Button onClick={() => onStartChat(selectedComposer)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02] mt-auto">
              Start Conversation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

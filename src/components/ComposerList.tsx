import { Composer, Era, getComposersByEra } from '@/data/composers';
import { ComposerCard } from './ComposerCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!selectedComposer && composers.length > 0) {
      onSelectComposer(composers[0]);
    }
  }, [composers, selectedComposer, onSelectComposer]);

  return (
    <div className="w-full mt-0">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-4 md:gap-6 lg:gap-8">
        {/* Left side - Scrolling composers */}
        <ScrollArea className="w-full bg-secondary/80 backdrop-blur-sm rounded-lg p-2 md:p-3">
          <div className="flex flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-2 w-max md:w-full pb-1">
            {composers.map(composer => (
              <ComposerCard
                key={composer.id}
                composer={composer}
                onClick={onSelectComposer}
                isSelected={selectedComposer?.id === composer.id}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="md:hidden" />
          <ScrollBar orientation="vertical" className="hidden md:flex" />
        </ScrollArea>

        {/* Right side - Biography with responsive layout */}
        {selectedComposer && (
          <div className="rounded-lg p-2 md:p-4 flex flex-col max-h-[70vh] md:max-h-none overflow-y-auto">
            {/* Header with responsive layout */}
            <div className="flex items-center space-x-4 md:space-x-6 mb-3">
              <div className="cursor-pointer">
                <ComposerImageViewer
                  composer={selectedComposer}
                  allowModalOnDesktop={true}
                  className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                />
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold font-serif">{selectedComposer.name}</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-1">
                  <span className="text-xs md:text-sm text-muted-foreground">
                    {selectedComposer.country}, {selectedComposer.years}
                  </span>
                  <Badge variant="badge" className="md:ml-2 w-fit">
                    {era === Era.Modern ? '20th-21st Century' : era}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Biography and works */}
            <ScrollArea className="flex-grow mb-4 md:mb-6 overflow-y-auto">
              <div className="space-y-4 md:space-y-6">
                <p className="text-sm md:text-base text-foreground/90">{selectedComposer.bio}</p>
                <div>
                  <h4 className="font-semibold mb-2 text-base md:text-lg">Notable Works</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedComposer.famousWorks.slice(0, 3).map((work, index) => (
                      <li key={index} className="text-sm md:text-base text-foreground/80">{work}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>

            {/* Start Conversation button with responsive sizing */}
            <Button
              onClick={() => onStartChat(selectedComposer)}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform duration-300 hover:scale-[1.02] mt-auto text-sm md:text-base py-2 md:py-3"
            >
              Start a Chat with {selectedComposer.name.split(' ').pop()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


import { useState } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era } from '@/data/composers';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  isOpen: boolean;
  selectedComposer: Composer | null;
}

export function ComposerMenu({ onSelectComposer, isOpen, selectedComposer }: ComposerMenuProps) {
  const [selectedEra, setSelectedEra] = useState<Era>(Era.Baroque);

  return (
    <div
      className={`bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center font-serif mt-2 mb-4">
          {selectedEra === Era.Modern ? '20th-21st Century' : selectedEra} Composer Conversations
        </h1>
        
        <Timeline selectedEra={selectedEra} onSelectEra={setSelectedEra} />
        
        <div className="px-2 md:px-6 pb-4">
          <ComposerList 
            era={selectedEra} 
            onSelectComposer={onSelectComposer}
            selectedComposer={selectedComposer}
          />
        </div>
      </div>
    </div>
  );
}

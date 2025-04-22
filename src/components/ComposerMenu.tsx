
import { useState } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era } from '@/data/composers';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  isOpen: boolean;
}

export function ComposerMenu({ onSelectComposer, isOpen }: ComposerMenuProps) {
  const [selectedEra, setSelectedEra] = useState<Era>(Era.Baroque);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 bg-background border-b border-border shadow-lg transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ height: isOpen ? 'min(100vh, 560px)' : 'auto' }}
    >
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        <h1 className="text-3xl font-bold text-center font-serif mt-4 mb-8">
          <span className="text-primary">Classical</span> Composer Conversations
        </h1>
        
        <Timeline selectedEra={selectedEra} onSelectEra={setSelectedEra} />
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <ComposerList era={selectedEra} onSelectComposer={onSelectComposer} />
        </div>
        
        <div className="mt-auto text-center text-sm text-muted-foreground pb-4">
          <p>Select a composer to start a conversation</p>
        </div>
      </div>
    </div>
  );
}

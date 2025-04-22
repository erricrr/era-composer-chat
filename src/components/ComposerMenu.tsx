
import { useState } from 'react';
import { Timeline } from './Timeline';
import { ComposerList } from './ComposerList';
import { Composer, Era } from '@/data/composers';

interface ComposerMenuProps {
  onSelectComposer: (composer: Composer) => void;
  onStartChat: (composer: Composer) => void;
  selectedComposer: Composer | null;
  isOpen: boolean;
}

export function ComposerMenu({
  onSelectComposer,
  onStartChat,
  selectedComposer,
  isOpen
}: ComposerMenuProps) {
  const [selectedEra, setSelectedEra] = useState<Era>(Era.Baroque);

  return (
    <div className="container mx-auto px-4 py-6 flex flex-col h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-center font-serif mt-2 mb-4 mx-[30px]">
        {selectedEra === Era.Modern ? '20th-21st Century' : selectedEra} Composer Conversations
      </h1>
      
      <Timeline selectedEra={selectedEra} onSelectEra={setSelectedEra} />
      
      <div className="px-2 md:px-6 pb-8 flex-grow overflow-y-auto">
        <ComposerList era={selectedEra} onSelectComposer={onSelectComposer} selectedComposer={selectedComposer} onStartChat={onStartChat} />
      </div>
    </div>
  );
}
